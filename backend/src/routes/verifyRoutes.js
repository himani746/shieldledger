const express = require("express");
const multer = require("multer");
const { keccak256 } = require("js-sha3");
const prisma = require("../lib/prisma");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const DEFAULT_INCLUDE = {
  uploader: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  organization: true,
  anchor_events: true,
};

async function findDocumentWithOptionalAnchors(hash) {
  try {
    const details = await prisma.document.findFirst({
      where: { sha3_hash: hash },
      include: DEFAULT_INCLUDE,
    });
    
    if (details && details.anchor_events && details.anchor_events.length > 0) {
      details.anchor_event = details.anchor_events[0];
    }
    
    return { details, include: DEFAULT_INCLUDE };
  } catch (error) {
    throw error;
  }
}

router.get(["/verify", "/documents/verify/:hash"], async (req, res) => {
  try {
    const rawHash = req.params?.hash || req.query?.hash || "";
    const hash = typeof rawHash === "string" ? rawHash.trim() : "";

    if (!hash) {
      return res.status(400).json({
        message: "Hash is required (as a query parameter or in the path).",
      });
    }

    const { details, include } = await findDocumentWithOptionalAnchors(hash);

    if (!details) {
      return res.status(404).json({
        authentic: false,
        message: "Document not found for the provided hash.",
      });
    }

    const hasAnchorEvents =
      Object.prototype.hasOwnProperty.call(include, "anchorEvents") ||
      Object.prototype.hasOwnProperty.call(include, "anchor_events");

    const anchorEvents = details.anchor_events || details.anchorEvents || [];
    const firstAnchor = anchorEvents.length > 0 ? anchorEvents[0] : null;

    return res.status(200).json({
      authentic: true,
      details,
      orgName: details.organization?.name || details.uploader?.name || null,
      txHash: firstAnchor ? (firstAnchor.tx_hash || firstAnchor.txHash) : null,
      anchoredAt: firstAnchor ? (firstAnchor.created_at || firstAnchor.createdAt) : null,
      blockNumber: firstAnchor ? (firstAnchor.block_number || firstAnchor.blockNumber) : null,
      anchorEventsIncluded: hasAnchorEvents,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Verification failed.",
      error: error.message,
    });
  }
});

router.post("/verify", upload.single("file"), async (req, res) => {
  try {
    const bodyHash = typeof req.body?.hash === "string" ? req.body.hash.trim() : "";
    const hash = req.file ? keccak256(req.file.buffer) : bodyHash;

    if (!hash) {
      return res.status(400).json({
        message: "Provide either a hash in body or upload a file.",
      });
    }

    const documentRecord = await prisma.document.findFirst({
      where: { sha3_hash: hash },
      include: {
        uploader: true,
        organization: true,
        anchor_events: true
      },
    });

    if (documentRecord && documentRecord.anchor_events && documentRecord.anchor_events.length > 0) {
      documentRecord.anchor_event = documentRecord.anchor_events[0];
    }

    return res.status(200).json({
      authentic: Boolean(documentRecord),
      details: documentRecord,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Verification failed.",
      error: error.message,
    });
  }
});

module.exports = router;
