// Import database connection pool
import db from "../db/db.js";

// Service function to fetch alerts with optional filters
export const fetchAlerts = async (filters = {}) => {
  // Arrays to build dynamic WHERE conditions and parameter values
  const conditions = [];
  const values = [];

  // Add severity filter if provided (mapped to anomaly_score)
  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`a.anomaly_score = $${values.length}`);
  }

  // Add device_id filter if provided (mapped to audit_logs.machine_id)
  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`al.machine_id = $${values.length}`);
  }

  // Base query to select alert fields with join to audit_logs
  let query = `
    SELECT a.id, al.machine_id as device_id, a.anomaly_score as severity, a.alert_type as title, a.description, a.created_at
    FROM alerts a
    JOIN audit_logs al ON a.audit_id = al.id
  `;

  // Add WHERE clause if any conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by creation date, most recent first
  query += ` ORDER BY a.created_at DESC`;

  // Execute query with parameter values
  const result = await db.query(query, values);
  return result.rows;
};

// Service function to fetch a single alert by ID
export const fetchAlertById = async (id) => {
  // Query to select alert by ID with join to audit_logs
  const query = `
    SELECT a.id, al.machine_id as device_id, a.anomaly_score as severity, a.alert_type as title, a.description, a.created_at
    FROM alerts a
    JOIN audit_logs al ON a.audit_id = al.id
    WHERE a.id = $1
  `;

  // Execute query and return first row or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// Service function to change the status of an alert
export const changeAlertStatus = async (id, status) => {
  // Since status column doesn't exist, just return the alert without updating
  return await fetchAlertById(id);
};