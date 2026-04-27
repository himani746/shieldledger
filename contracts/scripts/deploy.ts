import { ethers, network } from "hardhat";

async function main() {
  console.log("Deploying DocumentRegistry...");
  console.log("Network:", network.name);

  const Factory = await ethers.getContractFactory("DocumentRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("DocumentRegistry deployed to:", address);
  console.log("Network:", network.name);
  console.log(">>> COPY THIS ADDRESS INTO YOUR .env AS CONTRACT_ADDRESS <<<");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
