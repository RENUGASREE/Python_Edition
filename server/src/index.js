import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import { connectDB, isDbConnected } from "./config/db.js";
import { bootstrapDatabase } from "./seed/bootstrap.js";
import authRoutes from "./routes/auth.js";
import lessonRoutes from "./routes/lessons.js";
import progressRoutes from "./routes/progress.js";
import compilerRoutes from "./routes/compiler.js";
import projectRoutes from "./routes/projects.js";
import challengeRoutes from "./routes/challenges.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";
import profileRoutes from "./routes/profile.js";

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("FATAL: Set JWT_SECRET (min 16 chars) in environment");
  process.exit(1);
}

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan(isProd ? "combined" : "dev"));

const startedAt = Date.now();

app.get("/api/health", (_req, res) => {
  const dbOk = isDbConnected();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    app: "Python Edition API",
    db: dbOk ? "connected" : "disconnected",
    env: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    autoSeed: process.env.AUTO_SEED_ON_STARTUP !== "false",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.redirect("/api/health");
});

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/*", (_req, res) => res.status(404).json({ message: "API route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.message === "Not allowed by CORS" ? 403 : 500;
  res.status(status).json({
    message: isProd && status === 500 ? "Internal server error" : err.message || "Server error",
  });
});

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/python_edition";

async function start() {
  try {
    await connectDB(uri);

    const autoSeed = process.env.AUTO_SEED_ON_STARTUP !== "false";
    if (autoSeed) {
      console.log("[startup] Running idempotent curriculum bootstrap...");
      const report = await bootstrapDatabase({ force: false });
      console.log("[startup] Bootstrap done:", {
        lessons: report.lessons.after,
        challenges: report.challenges.after,
        admin: report.admin.created ? "created" : "ok",
      });
    } else {
      console.log("[startup] AUTO_SEED_ON_STARTUP=false — skipping bootstrap");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Python Edition API listening on port ${PORT} (${isProd ? "production" : "development"})`);
    });
  } catch (err) {
    console.error("FATAL startup error:", err.message);
    process.exit(1);
  }
}

start();
