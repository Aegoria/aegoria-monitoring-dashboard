import express from "express";
import { getLatestReport, scanNow } from "../controllers/scanController.js";

const router = express.Router();

// POST /scan runs the current scan pipeline summary.
router.post("/scan", scanNow);

// GET /report returns the latest generated report.
router.get("/report", getLatestReport);

export default router;
