import express from "express";
import {
  getLogs,
  getLogById
} from "../controllers/logsController.js";

const router = express.Router();

router.get("/", getLogs);
router.get("/:id", getLogById);

export default router;