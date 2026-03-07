import {
  fetchDashboardSummary,
  fetchDashboardActivity
} from "../services/dashboardService.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await fetchDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export const getDashboardActivity = async (req, res, next) => {
  try {
    const activity = await fetchDashboardActivity();
    res.json(activity);
  } catch (err) {
    next(err);
  }
};