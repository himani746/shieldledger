const Queue = require("bull");

const anchorQueue = process.env.REDIS_URL
  ? new Queue("anchor", process.env.REDIS_URL)
  : new Queue("anchor", { redis: { host: "127.0.0.1", port: 6379 } });

module.exports = anchorQueue;
