import { fetchLatestReport, runScan } from "../services/scanService.js";

// POST /scan triggers a lightweight database-backed scan summary.
export const scanNow = async (req, res, next) => {
  try {
    const result = await runScan();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /report returns the most recently generated report payload.
export const getLatestReport = async (req, res, next) => {
  try {
    const report = await fetchLatestReport();
    res.json(report);
  } catch (err) {
    next(err);
  }
};
