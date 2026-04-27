const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  const wallet = ethers.Wallet.createRandom();

  console.log("=================================");
  console.log("NEW WALLET GENERATED");
  console.log("=================================");
  console.log("Address:     ", wallet.address);
  console.log("Private Key: ", wallet.privateKey);
  console.log("=================================");
  console.log("SAVING TO .env automatically...");

  const envPath = path.join(__dirname, "../.env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  if (envContent.includes("DEPLOYER_PRIVATE_KEY=")) {
    envContent = envContent.replace(
      /DEPLOYER_PRIVATE_KEY=.*/,
      `DEPLOYER_PRIVATE_KEY=${wallet.privateKey}`
    );
  } else {
    envContent += `\nDEPLOYER_PRIVATE_KEY=${wallet.privateKey}`;
  }

  if (envContent.includes("DEPLOYER_ADDRESS=")) {
    envContent = envContent.replace(
      /DEPLOYER_ADDRESS=.*/,
      `DEPLOYER_ADDRESS=${wallet.address}`
    );
  } else {
    envContent += `\nDEPLOYER_ADDRESS=${wallet.address}`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log("Private key saved to .env as DEPLOYER_PRIVATE_KEY");
  console.log("Address saved to .env as DEPLOYER_ADDRESS");
  console.log("");
  console.log("NEXT STEP:");
  console.log("Get free test MATIC for this address:");
  console.log("https://faucet.polygon.technology");
  console.log("Paste this address:", wallet.address);
  console.log("=================================");
}

main().catch(console.error);
