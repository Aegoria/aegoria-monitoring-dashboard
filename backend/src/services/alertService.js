import db from "../db/db.js";

export const fetchAlerts = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`severity = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`device_id = $${values.length}`);
  }

  let query = `
    SELECT id, device_id, severity, title, description, status, created_at
    FROM alerts
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

export const fetchAlertById = async (id) => {
  const query = `
    SELECT id, device_id, severity, title, description, status, created_at
    FROM alerts
    WHERE id = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

export const changeAlertStatus = async (id, status) => {
  const allowedStatuses = ["open", "investigating", "resolved"];

  if (!allowedStatuses.includes(status)) {
    const err = new Error(
      `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
    );
    err.status = 400;
    throw err;
  }

  const query = `
    UPDATE alerts
    SET status = $1
    WHERE id = $2
    RETURNING id, device_id, severity, title, description, status, created_at
  `;

  const result = await db.query(query, [status, id]);
  return result.rows[0] || null;
};