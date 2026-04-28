const path = require("path");
const dotenv = require("dotenv");

const backendEnvPath = path.resolve(__dirname, "../../.env");
const contractsEnvPath = path.resolve(__dirname, "../../../contracts/.env");

dotenv.config({ path: contractsEnvPath });
dotenv.config({ path: backendEnvPath, override: true });

module.exports = { backendEnvPath, contractsEnvPath };
