import express from "express";
import {
  getAlerts,
  getAlertById,
  updateAlertStatus
} from "../controllers/alertsController.js";

const router = express.Router();

router.get("/", getAlerts);
router.get("/:id", getAlertById);
router.patch("/:id/status", updateAlertStatus);

export default router;