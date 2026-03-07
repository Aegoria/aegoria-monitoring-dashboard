import express from "express";
import {
  getDashboardSummary,
  getDashboardActivity
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/activity", getDashboardActivity);

export default router;