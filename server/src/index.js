import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import feedbackRouter from "./routes/feedback.js";
import authRouter from "./routes/auth.js";
import generateSaranRouter from "./routes/generateSaran.js";
import proxyGenerateRouter from "./routes/proxyGenerateSaran.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { getDbPool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("tiny"));

// Health check
app.get("/health", async (_req, res) => {
  let dbStatus = "unknown";
  try {
    const pool = await getDbPool();
    await pool.query("SELECT 1");
    dbStatus = "connected";
  } catch (e) {
    dbStatus = `disconnected (${e.message})`;
  }
  res.json({ status: "ok", uptime: process.uptime(), database: dbStatus });
});

// API root — discoverability
app.get("/api/v1", (_req, res) => {
  res.json({
    name: "PKKMB Feedback API (MySQL)",
    version: "1.0.0",
    resources: {
      auth: {
        login: "POST   /api/v1/auth/login",
      },
      feedback: {
        list: "GET    /api/v1/feedback",
        stats: "GET    /api/v1/feedback/stats",
        retrieve: "GET    /api/v1/feedback/:id",
        create: "POST   /api/v1/feedback",
        bulk: "POST   /api/v1/feedback/bulk",
        update: "PUT    /api/v1/feedback/:id",
        delete: "DELETE /api/v1/feedback/:id",
        deleteAll: "DELETE /api/v1/feedback",
      },
      ai: {
        generateSaran: "POST /api/generate-saran",
      },
    },
  });
});

// Resources
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/generate-saran", generateSaranRouter);
app.use("/api/generate-saran", proxyGenerateRouter);

// 404 + error
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Feedback API listening on http://localhost:${PORT}`);
  try {
    await getDbPool();
  } catch (err) {
    console.error("[Startup] MySQL init warning:", err.message);
  }
});
