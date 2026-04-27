const express = require("express");
const multer = require("multer");
const { keccak256 } = require("js-sha3");
const prisma = require("../lib/prisma");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const USER_INCLUDE = {
  user: {
    select: {
      id: true,
      email: true,
      org_name: true,
    },
  },
};

async function findDocumentWithOptionalAnchors(hash) {
  const includeVariants = [
    { ...USER_INCLUDE, anchorEvents: true },
    { ...USER_INCLUDE, anchor_events: true },
    USER_INCLUDE,
  ];

  for (const include of includeVariants) {
    try {
      const details = await prisma.document.findFirst({
        where: { hash },
        include,
      });
      return { details, include };
    } catch (error) {
      const message = String(error?.message || "");
      const isUnknownIncludeField =
        message.includes("Unknown field") && message.includes("for include statement");

      if (!isUnknownIncludeField) {
        throw error;
      }
    }
  }

  const details = await prisma.document.findFirst({
    where: { hash },
    include: USER_INCLUDE,
  });
  return { details, include: USER_INCLUDE };
}

router.get("/verify", async (req, res) => {
  try {
    const hash = typeof req.query?.hash === "string" ? req.query.hash.trim() : "";

    if (!hash) {
      return res.status(400).json({
        message: "Query parameter 'hash' is required.",
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

    return res.status(200).json({
      authentic: true,
      details,
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
      where: { hash },
      include: {
        user: true,
      },
    });

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
