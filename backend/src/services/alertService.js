// Import database connection pool
import db from "../db/db.js";

// Alerts now map directly to the columns defined in the new schema. The query
// also keeps a few descriptive fields from the linked audit log so the current
// UI can still display useful context without extra requests.
export const fetchAlerts = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.severity) {
    values.push(filters.severity);
    conditions.push(`a.severity = $${values.length}`);
  }

  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`a.device_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`a.status = $${values.length}`);
  }

  let query = `
    SELECT
      a.id,
      a.audit_id,
      a.device_id,
      d.name AS device_name,
      d.name AS machine_id,
      a.anomaly_score,
      a.alert_type,
      a.severity,
      a.status,
      a.title,
      a.description,
      a.created_at,
      al.event_type,
      al.event_message
    FROM alerts a
    LEFT JOIN audit_logs al ON a.audit_id = al.id
    LEFT JOIN devices d ON d.id = a.device_id
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY a.created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

export const fetchAlertById = async (id) => {
  const query = `
    SELECT
      a.id,
      a.audit_id,
      a.device_id,
      d.name AS device_name,
      d.name AS machine_id,
      a.anomaly_score,
      a.alert_type,
      a.severity,
      a.status,
      a.title,
      a.description,
      a.created_at,
      al.event_type,
      al.event_message
    FROM alerts a
    LEFT JOIN audit_logs al ON a.audit_id = al.id
    LEFT JOIN devices d ON d.id = a.device_id
    WHERE a.id = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// The new schema includes a real `status` column, so PATCH /alerts/:id/status
// performs an actual update and returns the fresh record.
export const changeAlertStatus = async (id, status) => {
  const query = `
    UPDATE alerts
    SET status = $2
    WHERE id = $1
    RETURNING id
  `;

  const result = await db.query(query, [id, status]);

  if (result.rowCount === 0) {
    return null;
  }

  return fetchAlertById(id);
};
