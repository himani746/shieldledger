require('dotenv').config();
const anchorQueue = require("../lib/queue");
const prisma = require("../lib/prisma");

anchorQueue.process(async (job) => {
  const { documentId, hash } = job.data;

  const anchorService = require("../../services/anchorService");
  const { txHash, blockNumber } = await anchorService.anchor(hash);

  await prisma.anchorEvent.create({
    data: {
      document_id: documentId,
      tx_hash: txHash,
      block_number: BigInt(blockNumber),
    },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "confirmed" },
  });

  console.log(
    `Document ${documentId} confirmed. hash=${hash} tx_hash=${txHash} block_number=${blockNumber}`
  );
});

console.log("Anchor worker started and listening for jobs...");
