require('dotenv').config();
const anchorQueue = require("../lib/queue");
const prisma = require("../lib/prisma");

anchorQueue.process(async (job) => {
  const { documentId, hash } = job.data;

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });

  const txHash = `0xabc${Date.now().toString(16)}`;
  const blockNumber = Math.floor(Date.now() / 1000);

  await prisma.anchorEvent.create({
    data: {
      tx_hash: txHash,
      block_number: blockNumber,
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
