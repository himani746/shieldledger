const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================");
  console.log("DEPLOYING DocumentRegistry");
  console.log("=================================");

  const network = hre.network.name;
  console.log("Network:", network);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deployer:", deployer.address);
  console.log("Balance: ", hre.ethers.formatEther(balance), "MATIC");
  console.log("");

  if (hre.ethers.formatEther(balance) < 0.01 && network !== "hardhat" && network !== "localhost") {
    console.error("ERROR: Insufficient balance for deployment");
    console.log("Get test MATIC from: https://faucet.polygon.technology");
    process.exit(1);
  }

  console.log("Deploying contract...");

  const Factory = await hre.ethers.getContractFactory("DocumentRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("");
  console.log("=================================");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("=================================");
  console.log("Contract address:", address);
  console.log("Network:         ", network);
  console.log("Deployer:        ", deployer.address);
  console.log("=================================");

  if (network !== "hardhat") {
    console.log("Polygonscan:");
    console.log(`https://mumbai.polygonscan.com/address/${address}`);
  }

  console.log("");
  console.log("Saving contract address to .env...");

  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");

  if (envContent.includes("CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${address}`
    );
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("CONTRACT_ADDRESS saved to .env automatically");

  console.log("");
  console.log("NEXT STEPS:");
  console.log("1. Run: node scripts/exportAbi.js");
  console.log("2. Run: node scripts/testAnchorService.js");
  if (network !== "hardhat") {
    console.log("3. Run: npx hardhat verify --network", network, address);
  }
  console.log("=================================");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
