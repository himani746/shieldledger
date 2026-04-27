const fs = require("fs");
const path = require("path");

async function main() {
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("ERROR: Artifact not found. Run: npx hardhat compile");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const backendServicesPath = path.join(__dirname, "../../backend/services");

  if (!fs.existsSync(backendServicesPath)) {
    fs.mkdirSync(backendServicesPath, { recursive: true });
    console.log("Created backend/services directory");
  }

  const outputPath = path.join(backendServicesPath, "abi.json");
  fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));

  const functions = artifact.abi.filter((x) => x.type === "function").map((x) => x.name);
  const events = artifact.abi.filter((x) => x.type === "event").map((x) => x.name);

  console.log("=================================");
  console.log("ABI EXPORTED SUCCESSFULLY");
  console.log("=================================");
  console.log("Output:    ", outputPath);
  console.log("Functions: ", functions);
  console.log("Events:    ", events);
  console.log("=================================");
}

main().catch(console.error);
