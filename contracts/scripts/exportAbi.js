const fs = require("fs");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/DocumentRegistry.sol/DocumentRegistry.json"
);
const outputPath = path.join(__dirname, "../../backend/services/abi.json");

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
fs.writeFileSync(outputPath, JSON.stringify(artifact.abi, null, 2));
console.log("ABI exported successfully");
console.log(
  "Functions found:",
  artifact.abi.filter((x) => x.type === "function").map((x) => x.name)
);
