const Queue = require("bull");

const anchorQueue = new Queue("anchor", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

module.exports = anchorQueue;
