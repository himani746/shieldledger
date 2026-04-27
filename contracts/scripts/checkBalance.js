const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const rpcUrl = process.env.MUMBAI_RPC_URL;
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!rpcUrl || rpcUrl.includes("YOUR_KEY") || rpcUrl === "") {
    console.error("ERROR: MUMBAI_RPC_URL is not set in .env");
    console.log("Get a free RPC URL from: https://alchemy.com");
    console.log("Create app -> Polygon -> Polygon Amoy -> Copy HTTPS URL");
    process.exit(1);
  }

  if (!privateKey || privateKey === "" || privateKey.includes("YOUR_PRIVATE_KEY")) {
    console.error("ERROR: DEPLOYER_PRIVATE_KEY is not set in .env");
    console.log("Run: node scripts/generateWallet.js");
    process.exit(1);
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);

    console.log("=================================");
    console.log("WALLET STATUS");
    console.log("=================================");
    console.log("Address: ", wallet.address);
    console.log("Balance: ", balanceEth, "MATIC");
    console.log("=================================");

    if (parseFloat(balanceEth) < 0.05) {
      console.log("STATUS: Insufficient balance");
      console.log("");
      console.log("Get free test MATIC:");
      console.log("1. Go to https://faucet.polygon.technology");
      console.log("2. Select Polygon Amoy network");
      console.log("3. Paste address:", wallet.address);
      console.log("4. Click Submit and wait 2 minutes");
      console.log("5. Run this script again to confirm");
    } else {
      console.log("STATUS: Ready to deploy");
    }
  } catch (err) {
    console.error("ERROR connecting to RPC:", err.message);
    console.log("Check your MUMBAI_RPC_URL in .env");
  }
}

main().catch(console.error);
