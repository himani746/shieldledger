const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

process.env.CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

const svc = require("../../backend/services/anchorService");

async function run() {
  console.log("Starting stress test — 10 sequential anchor calls...");
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < 10; i++) {
    const hash = "0x" + crypto.randomBytes(32).toString("hex");
    try {
      const r = await svc.anchor(hash);
      console.log(`[${i + 1}/10] OK — tx: ${r.txHash.slice(0, 12)}...`);
      passed++;
    } catch (e) {
      console.error(`[${i + 1}/10] FAILED:`, e.message);
      failed++;
    }
  }

  console.log("---");
  console.log(`Stress test complete. Passed: ${passed}/10  Failed: ${failed}/10`);
}

run();
