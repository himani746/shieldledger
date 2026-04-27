// prisma/seed.ts
// Run: npx ts-node prisma/seed.ts

import { PrismaClient, DocumentStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── helpers ────────────────────────────────────────────────────────────────

function sha3Mock(input: string): string {
  // deterministic fake keccak256 for seed data
  return '0x' + crypto.createHash('sha256').update(input).digest('hex')
}

function txHashMock(input: string): string {
  return '0x' + crypto.createHash('sha256').update('tx:' + input).digest('hex')
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randomStatus(forceConfirmed = false): DocumentStatus {
  if (forceConfirmed) return DocumentStatus.confirmed
  const roll = Math.random()
  if (roll < 0.6) return DocumentStatus.confirmed
  if (roll < 0.85) return DocumentStatus.anchoring
  return DocumentStatus.failed
}

// ─── org + user definitions ─────────────────────────────────────────────────

const ORGS = [
  {
    name: 'Meridian Clinic',
    slug: 'meridian-clinic',
    logo_url: 'https://placehold.co/200x200?text=MC',
    user: { name: 'Dr. Priya Nair', email: 'priya@meridianclinic.com', password: 'demo1234' },
    docs: [
      { title: 'Patient Consent Form — Rahul Desai',    type: 'consent_form',     filename: 'consent_rahul.pdf' },
      { title: 'Supplier Contract — MedEquip Ltd',       type: 'contract',         filename: 'supplier_medequip.pdf' },
      { title: 'Q2 Compliance Audit Report',             type: 'compliance_report', filename: 'compliance_q2.pdf' },
      { title: 'Employment Letter — Nurse Meera Joshi',  type: 'employment_letter', filename: 'emp_meera.pdf' },
      { title: 'Insurance Claim Invoice #INV-2024-0041', type: 'invoice',          filename: 'invoice_0041.pdf', hasVersions: true },
    ],
  },
  {
    name: 'GreenPath NGO',
    slug: 'greenpath-ngo',
    logo_url: 'https://placehold.co/200x200?text=GP',
    user: { name: 'Arjun Mehta', email: 'arjun@greenpathngo.org', password: 'demo1234' },
    docs: [
      { title: 'Grant Agreement — CSRG Foundation 2024',  type: 'contract',          filename: 'grant_csrg.pdf' },
      { title: 'Field Report — Maharashtra Flood Relief', type: 'compliance_report', filename: 'field_report_maha.pdf' },
      { title: 'Vendor NDA — PrintHouse Pvt Ltd',         type: 'nda',               filename: 'nda_printhouse.pdf' },
      { title: 'Board Resolution — FY 2024-25',           type: 'resolution',        filename: 'board_resolution.pdf' },
      { title: 'Donor Receipt — Anonymous Gift ₹5L',      type: 'invoice',           filename: 'donor_receipt.pdf' },
    ],
  },
  {
    name: 'Vertex SME Solutions',
    slug: 'vertex-sme',
    logo_url: 'https://placehold.co/200x200?text=VS',
    user: { name: 'Sneha Kulkarni', email: 'sneha@vertexsme.in', password: 'demo1234' },
    docs: [
      { title: 'Client SLA — RetailChain India',          type: 'contract',          filename: 'sla_retailchain.pdf' },
      { title: 'Tax Invoice #VSX-2024-0088',              type: 'invoice',           filename: 'invoice_0088.pdf' },
      { title: 'Software License Agreement — CloudBase',  type: 'nda',               filename: 'license_cloudbase.pdf' },
      { title: 'ISO 27001 Gap Assessment Report',         type: 'compliance_report', filename: 'iso_gap_assessment.pdf' },
      { title: 'Sub-Contractor Agreement — DevTeam X',    type: 'contract',          filename: 'subcontract_devteamx.pdf' },
    ],
  },
]

// ─── main seed ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting ShieldLedger seed...\n')

  // wipe in dependency order
  await prisma.signatory.deleteMany()
  await prisma.anchorEvent.deleteMany()
  await prisma.documentVersion.deleteMany()
  await prisma.document.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  console.log('🗑   Cleared existing data\n')

  for (const orgDef of ORGS) {
    // 1. create organisation
    const org = await prisma.organization.create({
      data: {
        name:     orgDef.name,
        slug:     orgDef.slug,
        logo_url: orgDef.logo_url,
      },
    })

    // 2. create user for this org
    const hashedPw = await bcrypt.hash(orgDef.user.password, 10)
    const user = await prisma.user.create({
      data: {
        name:            orgDef.user.name,
        email:           orgDef.user.email,
        password_hash:   hashedPw,
        organization_id: org.id,
        role:            'admin',
      },
    })

    console.log(`🏢  Org: ${org.name}`)
    console.log(`   👤  User: ${user.email}  (password: demo1234)`)

    // 3. create 5 documents
    for (let i = 0; i < orgDef.docs.length; i++) {
      const docDef = orgDef.docs[i]
      const createdAt  = daysAgo(30 - i * 5)  // spread over past 30 days
      const status     = docDef.hasVersions
        ? DocumentStatus.confirmed              // versioned doc is always confirmed
        : randomStatus()
      const hash       = sha3Mock(orgDef.slug + docDef.filename + '1')
      const s3Key      = `${orgDef.slug}/documents/${docDef.filename}`

      const doc = await prisma.document.create({
        data: {
          title:           docDef.title,
          document_type:   docDef.type,
          filename:        docDef.filename,
          s3_key:          s3Key,
          file_size_bytes: Math.floor(Math.random() * 800_000) + 50_000,
          mime_type:       'application/pdf',
          sha3_hash:       hash,
          status,
          uploaded_by:     user.id,
          organization_id: org.id,
          created_at:      createdAt,
        },
      })

      // 4. anchor event for confirmed docs
      if (status === DocumentStatus.confirmed) {
        await prisma.anchorEvent.create({
          data: {
            document_id:    doc.id,
            tx_hash:        txHashMock(hash),
            block_number:   BigInt(Math.floor(Math.random() * 5_000_000) + 50_000_000),
            network:        'polygon-mumbai',
            gas_used:       BigInt(Math.floor(Math.random() * 80_000) + 21_000),
            anchored_at:    new Date(createdAt.getTime() + 45_000), // ~45 sec after upload
          },
        })
      }

      // 5. add 2 signatories to every confirmed doc
      if (status === DocumentStatus.confirmed) {
        const signatories = [
          { email: `signer1@${orgDef.slug}.demo`, name: 'Primary Signer' },
          { email: `signer2@${orgDef.slug}.demo`, name: 'Witness Signer' },
        ]
        for (const sig of signatories) {
          await prisma.signatory.create({
            data: {
              document_id:  doc.id,
              email:        sig.email,
              name:         sig.name,
              invite_token: crypto.randomBytes(32).toString('hex'),
              signed_at:    new Date(createdAt.getTime() + 3_600_000), // 1 hr after upload
              ip_address:   `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            },
          })
        }
      }

      // 6. versioned document — create v2 with a second anchor
      if (docDef.hasVersions) {
        const hashV2  = sha3Mock(orgDef.slug + docDef.filename + '2')
        const s3KeyV2 = `${orgDef.slug}/documents/v2_${docDef.filename}`
        const v2Date  = new Date(createdAt.getTime() + 7 * 24 * 3_600_000) // 7 days later

        // save original version record
        await prisma.documentVersion.create({
          data: {
            document_id: doc.id,
            version:     1,
            sha3_hash:   hash,
            s3_key:      s3Key,
            label:       'Original submission',
            created_at:  createdAt,
          },
        })

        // save v2 version record
        await prisma.documentVersion.create({
          data: {
            document_id: doc.id,
            version:     2,
            sha3_hash:   hashV2,
            s3_key:      s3KeyV2,
            label:       'Revised after counter-party review',
            created_at:  v2Date,
          },
        })

        // anchor v2 separately
        await prisma.anchorEvent.create({
          data: {
            document_id:    doc.id,
            tx_hash:        txHashMock(hashV2),
            block_number:   BigInt(Math.floor(Math.random() * 5_000_000) + 55_000_000),
            network:        'polygon-mumbai',
            gas_used:       BigInt(Math.floor(Math.random() * 80_000) + 21_000),
            anchored_at:    new Date(v2Date.getTime() + 45_000),
            version:        2,
          },
        })

        console.log(`   📄  Doc: "${doc.title}"  [${status}]  ← 2 versions + 2 anchor events`)
      } else {
        console.log(`   📄  Doc: "${doc.title}"  [${status}]`)
      }
    }

    console.log()
  }

  // ── summary ──────────────────────────────────────────────────────────────
  const totals = {
    orgs:      await prisma.organization.count(),
    users:     await prisma.user.count(),
    docs:      await prisma.document.count(),
    versions:  await prisma.documentVersion.count(),
    anchors:   await prisma.anchorEvent.count(),
    signers:   await prisma.signatory.count(),
  }

  console.log('─'.repeat(44))
  console.log('✅  Seed complete')
  console.log(`   Organisations : ${totals.orgs}`)
  console.log(`   Users         : ${totals.users}`)
  console.log(`   Documents     : ${totals.docs}`)
  console.log(`   Versions      : ${totals.versions}`)
  console.log(`   Anchor events : ${totals.anchors}`)
  console.log(`   Signatories   : ${totals.signers}`)
  console.log('─'.repeat(44))
  console.log()
  console.log('Demo credentials (all passwords: demo1234)')
  console.log('  priya@meridianclinic.com')
  console.log('  arjun@greenpathngo.org')
  console.log('  sneha@vertexsme.in')
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
