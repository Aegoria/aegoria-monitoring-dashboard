import express from "express";
import {
  createReport,
  getReports,
  getReportById,
} from "../controllers/reportsController.js";

const router = express.Router();

// POST /reports - Store a new combined report
router.post("/", createReport);
// GET /reports - List all reports
router.get("/", getReports);
// GET /reports/:id - Get a specific report
router.get("/:id", getReportById);

export default router;
