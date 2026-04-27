const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const { keccak256 } = require("js-sha3");
const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../lib/prisma");
const anchorQueue = require("../lib/queue");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function buildInviteTransport() {
  const hasSmtpConfig =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS);

  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

async function sendInviteEmail({ to, documentHash, inviteToken }) {
  const frontendBase = process.env.FRONTEND_URL || "http://localhost:3001";
  const verifyUrl = `${frontendBase}/verify/${documentHash}`;

  const transporter = buildInviteTransport();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@shieldledger.local",
    to,
    subject: "ShieldLedger document signature invite",
    text: [
      "You have been invited to review and sign a document.",
      `Verify document: ${verifyUrl}`,
      `Invite token: ${inviteToken}`,
    ].join("\n"),
    html: `<p>You have been invited to review and sign a document.</p>
<p><a href="${verifyUrl}">Open verification page</a></p>
<p>Invite token: <code>${inviteToken}</code></p>`,
  });
}

async function findDocumentForCertificate(documentId, userId) {
  const includeVariants = [
    { user: { select: { org_name: true } }, anchorEvents: true },
    { user: { select: { org_name: true } }, anchor_events: true },
    { user: { select: { org_name: true } } },
  ];

  for (const include of includeVariants) {
    try {
      const details = await prisma.document.findFirst({
        where: { id: documentId, userId },
        include,
      });

      return details;
    } catch (error) {
      const message = String(error?.message || "");
      const isUnknownIncludeField =
        message.includes("Unknown field") && message.includes("for include statement");

      if (!isUnknownIncludeField) {
        throw error;
      }
    }
  }

  return prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { user: { select: { org_name: true } } },
  });
}

function extractTransactionHash(document) {
  const anchorList = document?.anchorEvents || document?.anchor_events || [];
  const firstAnchor = Array.isArray(anchorList) && anchorList.length > 0 ? anchorList[0] : null;
  if (!firstAnchor) {
    return "N/A";
  }

  return firstAnchor.tx_hash || firstAnchor.txHash || "N/A";
}

async function buildCertificatePdfBuffer({ title, orgName, hash, txHash, verifyUrl }) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const donePromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(24).text("ShieldLedger Certificate of Authenticity", { align: "center" });
  doc.moveDown(1.5);
  doc.fontSize(14).text(`Document Title: ${title || "Untitled"}`);
  doc.moveDown(0.5);
  doc.text(`Organisation Name: ${orgName || "N/A"}`);
  doc.moveDown(0.5);
  doc.text(`SHA-3 Hash: ${hash || "N/A"}`);
  doc.moveDown(0.5);
  doc.text(`Blockchain Transaction Hash: ${txHash || "N/A"}`);
  doc.moveDown(1.2);
  doc.text(`Verification URL: ${verifyUrl}`);

  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 180,
    margin: 1,
  });

  doc.moveDown(1);
  doc.image(qrBuffer, { fit: [180, 180], align: "center" });
  doc.end();

  return donePromise;
}

async function findDocumentForAudit(documentId, userId) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, userId },
    include: { user: { select: { org_name: true } } },
  });

  if (!document) return null;

  try {
    document.documentVersions = await prisma.documentVersion.findMany({ where: { documentId } });
  } catch(e) {
    document.documentVersions = [];
  }

  try {
    document.signatories = await prisma.signatory.findMany({ where: { documentId } });
  } catch(e) {
    document.signatories = [];
  }

  try {
    document.anchorEvents = await prisma.anchorEvent.findMany({ where: { documentId } });
  } catch(e) {
    try {
      document.anchorEvents = await prisma.anchor_event.findMany({ where: { documentId } });
    } catch (err) {
      document.anchorEvents = [];
    }
  }

  return document;
}

async function buildAuditPdfBuffer(document) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  const donePromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(24).text("ShieldLedger Audit Report", { align: "center" });
  doc.moveDown(2);
  doc.fontSize(14).text(`Document Title: ${document.title || "Untitled"}`);
  doc.moveDown(0.5);
  doc.text(`Organisation Name: ${document.user?.org_name || "N/A"}`);
  doc.moveDown(0.5);
  doc.text(`Final SHA-3 Hash: ${document.hash || "N/A"}`);
  
  doc.addPage();
  doc.fontSize(20).text("Version Timeline", { align: "left" });
  doc.moveDown(1);
  
  const versions = document.documentVersions || [];
  if (versions.length === 0) {
    doc.fontSize(12).text("No versions found.");
  } else {
    versions.forEach((v) => {
      doc.fontSize(12).text(`Version #: ${v.version_number || "N/A"}`);
      doc.text(`Hash: ${v.hash || "N/A"}`);
      doc.text(`Date Anchored: ${v.createdAt || v.created_at || "N/A"}`);
      doc.moveDown(0.5);
    });
  }

  doc.addPage();
  doc.fontSize(20).text("Signatory Log", { align: "left" });
  doc.moveDown(1);

  const signatories = document.signatories || [];
  if (signatories.length === 0) {
    doc.fontSize(12).text("No signatories found.");
  } else {
    signatories.forEach((s) => {
      doc.fontSize(12).text(`Email: ${s.email}`);
      doc.text(`Invitation Date: ${s.createdAt || s.created_at || "N/A"}`);
      if (s.signedAt || s.signed_at) {
        doc.text(`Signed At: ${s.signedAt || s.signed_at}`);
        doc.text(`IP Address: ${s.ipAddress || s.ip_address || "N/A"}`);
      }
      doc.moveDown(0.5);
    });
  }

  doc.end();
  return donePromise;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const documents = await prisma.document.findMany({
      where: { uploaded_by: userId },
      orderBy: { created_at: "desc" },
      include: {
        anchor_events: true,
      }
    });

    const mapped = documents.map(doc => {
      const anchorEvents = doc.anchor_events || [];
      const firstAnchor = anchorEvents.length > 0 ? anchorEvents[0] : null;
      return {
        id: doc.id,
        title: doc.title,
        status: doc.status,
        date: doc.created_at || doc.createdAt || new Date(),
        hash: doc.sha3_hash || doc.hash || "",
        txHash: firstAnchor ? (firstAnchor.tx_hash || firstAnchor.txHash) : null,
      };
    });

    return res.status(200).json(mapped);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch documents.",
      error: error.message,
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const documentId = req.params.id;

    console.log('Searching for ID in DB:', documentId, 'userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, uploaded_by: userId },
      include: {
        uploader: { select: { org_name: true, email: true } },
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    let versions = [];
    try {
      versions = await prisma.documentVersion.findMany({
        where: { document_id: documentId },
        orderBy: { version: "asc" },
      });
    } catch (e) {}

    let signatories = [];
    try {
      signatories = await prisma.signatory.findMany({
        where: { document_id: documentId },
      });
    } catch (e) {}

    let anchorEvents = [];
    try {
      anchorEvents = await prisma.anchorEvent.findMany({
        where: { document_id: documentId },
      });
    } catch (e) {
      try {
        anchorEvents = await prisma.anchor_event.findMany({
          where: { document_id: documentId },
        });
      } catch (err) {}
    }

    const firstAnchor = anchorEvents.length > 0 ? anchorEvents[0] : null;

    return res.status(200).json({
      id: document.id,
      title: document.title,
      status: document.status,
      hash: document.sha3_hash || document.hash || "",
      date: document.created_at || document.createdAt,
      mimeType: document.mime_type,
      fileSize: document.file_size_bytes,
      orgName: document.uploader?.org_name || null,
      ownerEmail: document.uploader?.email || null,
      txHash: firstAnchor ? (firstAnchor.tx_hash || firstAnchor.txHash) : null,
      blockNumber: firstAnchor ? (firstAnchor.block_number || firstAnchor.blockNumber) : null,
      network: "Polygon Mumbai",
      anchoredAt: firstAnchor ? (firstAnchor.created_at || firstAnchor.createdAt) : null,
      versions: versions.map(v => ({
        version: v.version,
        hash: v.sha3_hash,
        date: v.created_at || v.createdAt,
        note: v.label || (v.version === 1 ? "Original" : `Version ${v.version}`),
      })),
      signatories: signatories.map(s => ({
        email: s.email,
        signedAt: s.signed_at || s.signedAt || null,
        invitedAt: s.created_at || s.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch document.",
      error: error.message,
    });
  }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many upload requests from this IP, please try again after a minute" }
});

router.post("/upload", authMiddleware, uploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required." });
    }

    const hash = keccak256(req.file.buffer);
    const userId = req.user.id || req.user.userId;
    const safeName = req.file.originalname.replace(/\s+/g, "-");
    const s3Key = `docs/${uuidv4()}-${safeName}`;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!process.env.AWS_S3_BUCKET) {
      return res.status(500).json({ message: "AWS_S3_BUCKET is not configured." });
    }

    await s3
      .putObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ServerSideEncryption: "AES256",
      })
      .promise();

    const document = await prisma.document.create({
      data: {
        title: req.file.originalname,
        document_type: "contract",
        filename: req.file.originalname,
        s3_key: s3Key,
        file_size_bytes: req.file.size,
        mime_type: req.file.mimetype,
        sha3_hash: hash,
        status: "anchoring",
        uploaded_by: userId,
        organization_id: req.user.organization_id || req.user.organizationId,
      },
    });

    anchorQueue.add({ documentId: document.id, hash }).catch((queueError) => {
      console.error("Failed to enqueue anchor job:", queueError.message);
    });

    console.log("S3 Upload completed.");

    return res.status(201).json({
      message: "Document uploaded successfully.",
      document,
      status: "anchoring",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Document upload failed.",
      error: error.message,
    });
  }
});

router.get("/:id/certificate", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!documentId) {
      return res.status(400).json({ message: "Invalid document id." });
    }

    const document = await findDocumentForCertificate(documentId, userId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const txHash = extractTransactionHash(document);
    const verifyBase = process.env.FRONTEND_URL || "http://localhost:3001";
    const verifyUrl = `${verifyBase}/verify/${document.hash || ""}`;

    const pdfBuffer = await buildCertificatePdfBuffer({
      title: document.title,
      orgName: document.user?.org_name,
      hash: document.hash,
      txHash,
      verifyUrl,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="certificate-${document.id}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate certificate.",
      error: error.message,
    });
  }
});

router.post("/:id/signatories", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const documentId = req.params.id;
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!documentId) {
      return res.status(400).json({ message: "Invalid document id." });
    }

    if (!email) {
      return res.status(400).json({ message: "Valid email is required." });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      select: {
        id: true,
        hash: true,
      },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found or access denied." });
    }

    if (!document.hash) {
      return res.status(400).json({ message: "Document hash is not available yet." });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");

    const signatory = await prisma.signatory.create({
      data: {
        documentId,
        email,
        invite_token: inviteToken,
      },
    });

    await sendInviteEmail({
      to: email,
      documentHash: document.hash,
      inviteToken,
    });

    return res.status(201).json(signatory);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create signatory invite.",
      error: error.message,
    });
  }
});

router.post("/:id/version", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required." });
    }

    const userId = req.user.id || req.user.userId;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!documentId) {
      return res.status(400).json({ message: "Invalid document id." });
    }

    const parentDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!parentDocument) {
      return res.status(404).json({ message: "Document not found." });
    }

    const hash = keccak256(req.file.buffer);

    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId },
      orderBy: { version_number: "desc" },
      select: { version_number: true },
    });

    const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

    const version = await prisma.documentVersion.create({
      data: {
        documentId,
        hash,
        version_number: nextVersionNumber,
        status: "anchoring",
      },
    });

    anchorQueue.add({ documentId, hash }).catch((queueError) => {
      console.error("Failed to enqueue anchor job for version:", queueError.message);
    });

    return res.status(201).json(version);
  } catch (error) {
    return res.status(500).json({
      message: "Document version upload failed.",
      error: error.message,
    });
  }
});

router.get("/:id/audit", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!documentId) {
      return res.status(400).json({ message: "Invalid document id." });
    }

    const document = await findDocumentForAudit(documentId, userId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const pdfBuffer = await buildAuditPdfBuffer(document);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="audit-${document.id}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate audit report.",
      error: error.message,
    });
  }
});

module.exports = router;
