// Import alert service functions
import {
  fetchAlerts,
  fetchAlertById,
  changeAlertStatus
} from "../services/alertService.js";

// Controller function to get all alerts with optional filters
export const getAlerts = async (req, res, next) => {
  try {
    const filters = {
      severity: req.query.severity,
      device_id: req.query.device_id,
      status: req.query.status
    };

    const alerts = await fetchAlerts(filters);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

// Controller function to get a specific alert by ID
export const getAlertById = async (req, res, next) => {
  try {
    // Extract alert ID from URL parameters
    const { id } = req.params;
    const alert = await fetchAlertById(id);

    // Return 404 if alert not found
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(alert);
  } catch (err) {
    next(err);
  }
};

// Controller function to update the status of an alert
export const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedAlert = await changeAlertStatus(id, status);

    if (!updatedAlert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(updatedAlert);
  } catch (err) {
    next(err);
  }
};
