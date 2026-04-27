import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = ethers.provider;
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || "", provider);
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet address:", wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  if (balance < ethers.parseEther("0.05")) {
    console.warn("WARNING: Balance low. Get test MATIC from faucet.polygon.technology");
  } else {
    console.log("Balance OK — ready to deploy.");
  }
}

main().catch(console.error);
