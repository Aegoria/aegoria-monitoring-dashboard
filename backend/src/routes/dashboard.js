// Import Express framework and dashboard controller functions
import express from "express";
import {
  getDashboardSummary,
  getDashboardActivity
} from "../controllers/dashboardController.js";

// Create Express router instance
const router = express.Router();

// Define routes for dashboard
// GET /dashboard/summary - Get dashboard summary data
router.get("/summary", getDashboardSummary);
// GET /dashboard/activity - Get dashboard activity data
router.get("/activity", getDashboardActivity);

// Export the router for use in the main application
export default router;