// Import database connection pool
import db from "../db/db.js";

// The log endpoints expose audit log data using the field names documented in
// Swagger. Compatibility aliases are also returned so the current UI does not
// need to change.
export const fetchLogs = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`al.device_id = $${values.length}`);
  }

  if (filters.event_type) {
    values.push(filters.event_type);
    conditions.push(`al.event_type = $${values.length}`);
  }

  if (filters.start) {
    values.push(filters.start);
    conditions.push(`al.event_time >= $${values.length}`);
  }

  if (filters.end) {
    values.push(filters.end);
    conditions.push(`al.event_time <= $${values.length}`);
  }

  let query = `
    SELECT
      al.id,
      al.device_id,
      d.name AS device_name,
      d.name AS machine_id,
      al.machine_id,
      al.event_type,
      al.event_message AS message,
      al.event_message,
      al.event_time AS timestamp,
      al.event_time,
      al.severity,
      al.user_id,
      u.username,
      al.created_at
    FROM audit_logs al
    LEFT JOIN devices d ON d.id = al.device_id
    LEFT JOIN users u ON u.id = al.user_id
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY al.event_time DESC NULLS LAST, al.created_at DESC`;

  const limit = Number(filters.limit) || 100;
  values.push(limit);
  query += ` LIMIT $${values.length}`;

  const result = await db.query(query, values);
  return result.rows;
};

// A single log lookup uses the exact same projection as the list endpoint so
// both routes stay consistent for the client.
export const fetchLogById = async (id) => {
  const query = `
    SELECT
      al.id,
      al.device_id,
      d.name AS device_name,
      d.name AS machine_id,
      al.machine_id,
      al.event_type,
      al.event_message AS message,
      al.event_message,
      al.event_time AS timestamp,
      al.event_time,
      al.severity,
      al.user_id,
      u.username,
      al.created_at
    FROM audit_logs al
    LEFT JOIN devices d ON d.id = al.device_id
    LEFT JOIN users u ON u.id = al.user_id
    WHERE al.id = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};
