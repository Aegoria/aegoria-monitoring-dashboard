import {
  fetchLogs,
  fetchLogById
} from "../services/logService.js";

export const getLogs = async (req, res, next) => {
  try {
    const filters = {
      device_id: req.query.device_id,
      event_type: req.query.event_type,
      start: req.query.start,
      end: req.query.end,
      limit: req.query.limit
    };

    const logs = await fetchLogs(filters);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const getLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await fetchLogById(id);

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json(log);
  } catch (err) {
    next(err);
  }
};