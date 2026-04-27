const { execSync } = require("child_process");
const path = require("path");

function run(cmd, label) {
  console.log("");
  console.log(`>>> ${label}`);
  console.log(`    ${cmd}`);
  console.log("");
  try {
    execSync(cmd, {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
    return true;
  } catch (err) {
    console.error(`FAILED: ${label}`);
    return false;
  }
}

async function main() {
  console.log("=================================");
  console.log("SHIELDLEDGER FULL DEPLOY SEQUENCE");
  console.log("=================================");

  const network = process.argv[2] || "localhost";
  console.log("Target network:", network);
  console.log("");

  const steps = [
    {
      cmd: "npx hardhat compile",
      label: "Step 1/4 — Compile contracts",
    },
    {
      cmd: "npx hardhat test",
      label: "Step 2/4 — Run tests (must be 5 passing)",
    },
    {
      cmd: `npx hardhat run scripts/deploy.js --network ${network}`,
      label: "Step 3/4 — Deploy to " + network,
    },
    {
      cmd: "node scripts/exportAbi.js",
      label: "Step 4/4 — Export ABI to backend",
    },
  ];

  for (const step of steps) {
    const ok = run(step.cmd, step.label);
    if (!ok) {
      console.error("");
      console.error("Deploy sequence stopped at: " + step.label);
      console.error("Fix the error above and run again.");
      process.exit(1);
    }
  }

  console.log("");
  console.log("=================================");
  console.log("FULL DEPLOY COMPLETE");
  console.log("=================================");
  console.log("Contract is deployed and ABI is exported.");
  console.log("Your blockchain component is ready.");
  console.log("");
  console.log("Test it with:");
  console.log("  node scripts/testAnchorService.js");
  console.log("=================================");
}

main().catch(console.error);
