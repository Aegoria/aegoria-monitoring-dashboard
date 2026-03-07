import db from "../db/db.js";

export const fetchLogs = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`device_id = $${values.length}`);
  }

  if (filters.event_type) {
    values.push(filters.event_type);
    conditions.push(`event_type = $${values.length}`);
  }

  if (filters.start) {
    values.push(filters.start);
    conditions.push(`timestamp >= $${values.length}`);
  }

  if (filters.end) {
    values.push(filters.end);
    conditions.push(`timestamp <= $${values.length}`);
  }

  let query = `
    SELECT id, device_id, timestamp, event_type, process_name, user_account, network_ip, raw_data, created_at
    FROM logs
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += ` ORDER BY timestamp DESC`;

  const limit = Number(filters.limit) || 100;
  values.push(limit);
  query += ` LIMIT $${values.length}`;

  const result = await db.query(query, values);
  return result.rows;
};

export const fetchLogById = async (id) => {
  const query = `
    SELECT id, device_id, timestamp, event_type, process_name, user_account, network_ip, raw_data, created_at
    FROM logs
    WHERE id = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};