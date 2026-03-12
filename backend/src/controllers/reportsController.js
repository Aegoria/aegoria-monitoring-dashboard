import {
  insertReport,
  fetchReports,
  fetchReportById,
} from "../services/reportService.js";

export const createReport = async (req, res, next) => {
  try {
    const report = await insertReport(req.body);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await fetchReports();
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await fetchReportById(id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
};
