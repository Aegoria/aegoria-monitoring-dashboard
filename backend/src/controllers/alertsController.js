// Import alert service functions
import {
  fetchAlerts,
  fetchAlertById,
  changeAlertStatus
} from "../services/alertService.js";

// Controller function to get all alerts with optional filters
export const getAlerts = async (req, res, next) => {
  try {
    // Extract filter parameters from query string
    const filters = {
      severity: req.query.severity,
      device_id: req.query.device_id
    };

    // Fetch alerts from service layer
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
    // Extract alert ID from URL parameters
    const { id } = req.params;
    // Extract new status from request body
    const { status } = req.body;

    // Validate that status is provided
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Update alert status via service layer
    const updatedAlert = await changeAlertStatus(id, status);

    // Return 404 if alert not found
    if (!updatedAlert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(updatedAlert);
  } catch (err) {
    next(err);
  }
};