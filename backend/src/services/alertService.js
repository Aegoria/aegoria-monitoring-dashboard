// Import database connection pool
import db from "../db/db.js";

// Service function to fetch alerts with optional filters
export const fetchAlerts = async (filters = {}) => {
  // Arrays to build dynamic WHERE conditions and parameter values
  const conditions = [];
  const values = [];

  // Add severity filter if provided
  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`severity = $${values.length}`);
  }

  // Add status filter if provided
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  // Add device_id filter if provided
  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`device_id = $${values.length}`);
  }

  // Base query to select alert fields
  let query = `
    SELECT id, device_id, severity, title, description, status, created_at
    FROM alerts
  `;

  // Add WHERE clause if any conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by creation date, most recent first
  query += ` ORDER BY created_at DESC`;

  // Execute query with parameter values
  const result = await db.query(query, values);
  return result.rows;
};

// Service function to fetch a single alert by ID
export const fetchAlertById = async (id) => {
  // Query to select alert by ID
  const query = `
    SELECT id, device_id, severity, title, description, status, created_at
    FROM alerts
    WHERE id = $1
  `;

  // Execute query and return first row or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// Service function to change the status of an alert
export const changeAlertStatus = async (id, status) => {
  // Define allowed status values
  const allowedStatuses = ["open", "investigating", "resolved"];

  // Validate status value
  if (!allowedStatuses.includes(status)) {
    const err = new Error(
      `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
    );
    err.status = 400;
    throw err;
  }

  // Query to update alert status and return updated record
  const query = `
    UPDATE alerts
    SET status = $1
    WHERE id = $2
    RETURNING id, device_id, severity, title, description, status, created_at
  `;

  // Execute update query
  const result = await db.query(query, [status, id]);
  return result.rows[0] || null;
};