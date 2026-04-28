const express = require("express");
const { anchor, verify, getHistory } = require("../../services/anchorService");

const router = express.Router();

router.get("/prototype/health", async (req, res) => {
  try {
    const required = ["MUMBAI_RPC_URL", "DEPLOYER_PRIVATE_KEY", "CONTRACT_ADDRESS"];
    const missing = required.filter((k) => !process.env[k]);
    return res.status(200).json({
      ok: missing.length === 0,
      mode: "prototype",
      missing,
      contractAddress: process.env.CONTRACT_ADDRESS || null,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/prototype/anchor", async (req, res) => {
  try {
    const { hash, metadataCID = "" } = req.body || {};
    if (!hash || typeof hash !== "string") {
      return res.status(400).json({ message: "hash is required" });
    }
    const result = await anchor(hash, metadataCID);
    return res.status(201).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/prototype/verify", async (req, res) => {
  try {
    const hash = typeof req.query.hash === "string" ? req.query.hash : "";
    if (!hash) {
      return res.status(400).json({ message: "hash query param is required" });
    }
    const result = await verify(hash);
    if (!result) {
      return res.status(404).json({ authentic: false, hash });
    }
    return res.status(200).json({ authentic: true, hash, ...result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/prototype/history", async (req, res) => {
  try {
    const hash = typeof req.query.hash === "string" ? req.query.hash : "";
    if (!hash) {
      return res.status(400).json({ message: "hash query param is required" });
    }
    const history = await getHistory(hash);
    return res.status(200).json({ ok: true, hash, events: history });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/prototype/documents", async (req, res) => {
  try {
    const allEvents = await getHistory(null);
    const docs = allEvents
      .slice()
      .reverse()
      .map((event) => ({
        id: event.hash,
        title: event.hash.slice(0, 16) + "...",
        hash: event.hash,
        owner: event.owner,
        timestamp: event.timestamp,
        txHash: event.txHash,
        block: event.block,
        status: "confirmed",
      }));
    return res.status(200).json({ ok: true, documents: docs });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
