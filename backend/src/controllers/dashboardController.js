// Import dashboard service functions
import {
  fetchDashboardSummary,
  fetchDashboardActivity
} from "../services/dashboardService.js";

// Controller function to get dashboard summary data
export const getDashboardSummary = async (req, res, next) => {
  try {
    // Fetch summary data from service layer
    const summary = await fetchDashboardSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// Controller function to get dashboard activity data
export const getDashboardActivity = async (req, res, next) => {
  try {
    // Fetch activity data from service layer
    const activity = await fetchDashboardActivity();
    res.json(activity);
  } catch (err) {
    next(err);
  }
};