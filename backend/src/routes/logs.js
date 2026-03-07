// Import Express framework and log controller functions
import express from "express";
import {
  getLogs,
  getLogById
} from "../controllers/logsController.js";

// Create Express router instance
const router = express.Router();

// Define routes for logs
// GET /logs - Get logs with optional filters
router.get("/", getLogs);
// GET /logs/:id - Get a specific log by ID
router.get("/:id", getLogById);

// Export the router for use in the main application
export default router;