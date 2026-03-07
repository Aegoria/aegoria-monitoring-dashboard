import {
  fetchAlerts,
  fetchAlertById,
  changeAlertStatus
} from "../services/alertService.js";

export const getAlerts = async (req, res, next) => {
  try {
    const filters = {
      severity: req.query.severity,
      status: req.query.status,
      device_id: req.query.device_id
    };

    const alerts = await fetchAlerts(filters);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await fetchAlertById(id);

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    res.json(alert);
  } catch (err) {
    next(err);
  }
};

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