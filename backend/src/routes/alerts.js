// Import Express framework and alert controller functions
import express from "express";
import {
  getAlerts,
  getAlertById,
  updateAlertStatus
} from "../controllers/alertsController.js";

// Create Express router instance
const router = express.Router();

// Define routes for alerts
// GET /alerts - Get all alerts with optional filters
router.get("/", getAlerts);
// GET /alerts/:id - Get a specific alert by ID
router.get("/:id", getAlertById);
// PATCH /alerts/:id/status - Update the status of a specific alert
router.patch("/:id/status", updateAlertStatus);

// Export the router for use in the main application
export default router;