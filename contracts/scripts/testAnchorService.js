const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { txUrl } = require("../../backend/utils/polygonscan");

dotenv.config({ path: path.join(__dirname, "../.env") });

const backendEnvPath = path.join(__dirname, "../../backend/.env");
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath, override: true });
}

const anchorService = require("../../backend/services/anchorService");

async function run() {
  console.log("Testing anchorService end-to-end...");
  const hash = "0x" + crypto.randomBytes(32).toString("hex");
  console.log("Generated hash:", hash);

  try {
    const anchorResult = await anchorService.anchor(hash);
    console.log("Anchor txHash:", anchorResult.txHash);
    console.log("Polygonscan:", txUrl(anchorResult.txHash));

    const verifyResult = await anchorService.verify(hash);
    console.log("Verify result:", verifyResult);

    const history = await anchorService.getHistory(hash);
    console.log("History events:", history);

    console.log("PASS");
  } catch (error) {
    console.error("FAIL");
    console.error(error.message);
    process.exitCode = 1;
  }
}

run();
