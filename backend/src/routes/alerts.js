// Import Express framework and alert controller functions
import express from "express";
import {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  createAlert,
} from "../controllers/alertsController.js";

const router = express.Router();

// POST /alerts - Create a new alert (used by AI model)
router.post("/", createAlert);
// GET /alerts - Get all alerts with optional filters
router.get("/", getAlerts);
// GET /alerts/:id - Get a specific alert by ID
router.get("/:id", getAlertById);
// PATCH /alerts/:id/status - Update the status of a specific alert
router.patch("/:id/status", updateAlertStatus);

// Export the router for use in the main application
export default router;