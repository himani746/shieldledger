"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  FileText,
  Hash,
  Link2,
  Search,
  Shield,
  Upload,
} from "lucide-react";

const words = ["Your", "Documents.", "Permanently", "Protected."];
const stats = [
  { value: 2400000, label: "Documents Registered", suffix: "M+" },
  { value: 18700, label: "Theft Alerts Sent", suffix: "" },
  { value: 0.001, label: "Per Document", suffix: "$" },
  { value: 99.9, label: "Uptime", suffix: "%" },
];

export default function HomePage() {
  return (
    <main className="bg-background text-text">
      <section className="relative flex min-h-screen items-center overflow-hidden mesh-bg px-6">
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-primary/30"
              style={{ left: `${(i * 11) % 100}%`, top: `${(i * 17) % 100}%` }}
              animate={{ y: [-6, 6, -6], opacity: [0.3, 0.9, 0.3] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 + (i % 4) }}
            />
          ))}
        </div>
        <div className="mx-auto max-w-5xl text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Open Source · Polygon Blockchain
          </motion.span>
          <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
            <div className="flex justify-center gap-2">
              {words.slice(0, 2).map((word, idx) => (
                <motion.span key={word} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="gradient-text mt-2 flex justify-center gap-2">
              {words.slice(2).map((word, idx) => (
                <motion.span key={word} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}>
                  {word}
                </motion.span>
              ))}
            </div>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted">
            Anchor any document to the Polygon blockchain. Prove authenticity forever. Tamper-proof. Free for individuals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-6 py-3 font-semibold transition hover-glow-purple">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/verify" className="rounded-xl border border-secondary/60 px-6 py-3 font-semibold text-secondary transition hover:bg-secondary/10">
              Verify a Document
            </Link>
          </div>
        </div>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.4 }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted">
          ↓
        </motion.div>
      </section>

      <section className="px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Everything you need to protect your documents</h2>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            [Shield, "Cryptographic Proof", "SHA-3 hash of your document anchored permanently on the Polygon blockchain", "text-primary"],
            [Search, "Instant Verification", "Anyone can verify document authenticity in seconds with just the file or its hash", "text-secondary"],
            [FileText, "Tamper Evidence", "Any modification to the file after anchoring is immediately detected and flagged", "text-primary"],
          ].map(([Icon, title, desc, color], i) => (
            <motion.article
              key={title as string}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              viewport={{ once: true }}
              className="glass-card hover-glow-purple rounded-2xl p-6 transition hover:-translate-y-1"
            >
              {/* @ts-expect-error icon type union for compact mapping */}
              <Icon className={`mb-4 h-8 w-8 ${color}`} />
              <h3 className="text-xl font-semibold">{title as string}</h3>
              <p className="mt-3 text-muted">{desc as string}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="grid-bg px-6 py-20">
        <h2 className="mb-14 text-center text-3xl font-bold">From upload to proof in seconds</h2>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          {[
            [Upload, "Upload Document", "Drag and drop any PDF, DOCX, or image"],
            [Hash, "Hash Computed", "SHA-3 fingerprint generated from file contents"],
            [Link2, "Anchored On-Chain", "Hash permanently written to Polygon blockchain"],
            [Award, "Certificate Issued", "Tamper-evident PDF certificate generated"],
          ].map(([Icon, title, desc], i) => (
            <motion.div
              key={title as string}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-border bg-surface/70 p-5"
            >
              {i < 3 && <div className="absolute right-[-22px] top-11 hidden h-[2px] w-10 border-t border-dashed border-primary/60 md:block" />}
              {/* @ts-expect-error icon type union for compact mapping */}
              <Icon className="mb-3 h-7 w-7 text-primary" />
              <h3 className="font-semibold">{title as string}</h3>
              <p className="mt-2 text-sm text-muted">{desc as string}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 bg-surface px-6 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <StatItem key={s.label} {...s} />
        ))}
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 border-t border-border px-6 py-8 text-sm text-muted md:flex-row">
        <div>
          <p className="text-text">ShieldLedger</p>
          <p>Tamper-evident document trail for SMEs</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1">Open source · MIT License</span>
        <p>Built on Polygon</p>
      </footer>
    </main>
  );
}

function StatItem({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const display = label.includes("Per")
    ? `${suffix}${value.toFixed(3)}`
    : label.includes("Uptime")
      ? `${value}${suffix}`
      : label.includes("Documents")
        ? `${(value / 1000000).toFixed(1)}${suffix}`
        : `${value.toLocaleString()}${suffix}`;

  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
      <p className="text-3xl font-bold text-text">{display}</p>
      <p className="text-xs text-muted md:text-sm">{label}</p>
    </motion.div>
  );
}
