const { ethers } = require("ethers");
const abi = require("./abi.json");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

async function anchor(hexHash, metadataCID = "", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const tx = await contract.anchorDocument(hexHash, metadataCID);
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Anchor attempt ${i + 1} failed, retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function verify(hexHash) {
  const [exists, owner, timestamp] = await contract.verifyDocument(hexHash);
  if (!exists) return null;
  return {
    owner,
    timestamp: new Date(Number(timestamp) * 1000).toISOString(),
  };
}

async function getHistory(hexHash) {
  const filter = hexHash
    ? contract.filters.DocumentAnchored(hexHash)
    : contract.filters.DocumentAnchored();
  const events = await contract.queryFilter(filter, 0, "latest");
  return events.map((e) => ({
    hash: e.args.hash,
    owner: e.args.owner,
    timestamp: new Date(Number(e.args.timestamp) * 1000).toISOString(),
    txHash: e.transactionHash,
    block: e.blockNumber,
  }));
}

module.exports = { anchor, verify, getHistory };
