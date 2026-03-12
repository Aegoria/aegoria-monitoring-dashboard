import express from "express";
import db from "../db/db.js";

const router = express.Router();

// GET /system/status - Returns health of all Aegoria services
router.get("/status", async (req, res) => {
  const status = {
    dashboard_backend: "online",
    database: "disconnected",
    rust_engine: "unknown",
    ai_service: "unknown",
  };

  // Check database
  try {
    await db.query("SELECT 1");
    status.database = "connected";
  } catch {
    status.database = "disconnected";
  }

  // Check Rust engine
  try {
    const resp = await fetch("http://localhost:3000/health", {
      signal: AbortSignal.timeout(3000),
    });
    status.rust_engine = resp.ok ? "online" : "error";
  } catch {
    status.rust_engine = "offline";
  }

  // Check AI service
  try {
    const resp = await fetch("http://localhost:5001/health", {
      signal: AbortSignal.timeout(3000),
    });
    status.ai_service = resp.ok ? "online" : "error";
  } catch {
    status.ai_service = "offline";
  }

  res.json(status);
});

export default router;
