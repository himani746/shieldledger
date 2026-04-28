require("./lib/loadEnv");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prototypeRoutes = require("./routes/prototypeRoutes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/api", prototypeRoutes);

if (process.env.DATABASE_URL) {
  const authRoutes = require("./routes/authRoutes");
  const documentRoutes = require("./routes/documentRoutes");
  const userRoutes = require("./routes/userRoutes");
  const verifyRoutes = require("./routes/verifyRoutes");

  app.use("/api/auth", authRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api", userRoutes);
  app.use("/api", verifyRoutes);
} else {
  console.warn("DATABASE_URL not set. Running prototype blockchain routes only.");
}

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    mode: process.env.DATABASE_URL ? "full" : "prototype",
    blockchain: Boolean(
      process.env.MUMBAI_RPC_URL &&
      process.env.DEPLOYER_PRIVATE_KEY &&
      process.env.CONTRACT_ADDRESS
    ),
    message: "ShieldLedger backend is running",
  });
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
});