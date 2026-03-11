// Import log service functions
import {
  fetchLogs,
  fetchLogById
} from "../services/logService.js";

// Controller function to get logs with optional filters
export const getLogs = async (req, res, next) => {
  try {
    // Extract filter parameters from query string
    const filters = {
      device_id: req.query.device_id,
      event_type: req.query.event_type,
      start: req.query.start,
      end: req.query.end,
      limit: req.query.limit
    };

    // Fetch logs from service layer
    const logs = await fetchLogs(filters);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// Controller function to get a specific log by ID
export const getLogById = async (req, res, next) => {
  try {
    // Extract log ID from URL parameters
    const { id } = req.params;
    const log = await fetchLogById(id);

    // Return 404 if log not found
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json(log);
  } catch (err) {
    next(err);
  }
};