// Import Express framework and device controller functions
import express from "express";
import {
  getDevices,
  getDeviceById
} from "../controllers/devicesController.js";

// Create Express router instance
const router = express.Router();

// Define routes for devices
// GET /devices - Get all devices
router.get("/", getDevices);
// GET /devices/:id - Get a specific device by ID
router.get("/:id", getDeviceById);

// Export the router for use in the main application
export default router;