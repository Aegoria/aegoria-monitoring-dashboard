// Import database connection pool
import db from "../db/db.js";

// Service function to fetch logs with optional filters
export const fetchLogs = async (filters = {}) => {
  // Arrays to build dynamic WHERE conditions and parameter values
  const conditions = [];
  const values = [];

  // Add device_id filter if provided
  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`device_id = $${values.length}`);
  }

  // Add event_type filter if provided
  if (filters.event_type) {
    values.push(filters.event_type);
    conditions.push(`event_type = $${values.length}`);
  }

  // Add start timestamp filter if provided
  if (filters.start) {
    values.push(filters.start);
    conditions.push(`timestamp >= $${values.length}`);
  }

  // Add end timestamp filter if provided
  if (filters.end) {
    values.push(filters.end);
    conditions.push(`timestamp <= $${values.length}`);
  }

  // Base query to select log fields
  let query = `
    SELECT id, device_id, timestamp, event_type, process_name, user_account, network_ip, raw_data, created_at
    FROM logs
  `;

  // Add WHERE clause if any conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by timestamp, most recent first
  query += ` ORDER BY timestamp DESC`;

  // Apply limit (default 100 if not specified)
  const limit = Number(filters.limit) || 100;
  values.push(limit);
  query += ` LIMIT $${values.length}`;

  // Execute query and return log entries
  const result = await db.query(query, values);
  return result.rows;
};

// Service function to fetch a single log entry by ID
export const fetchLogById = async (id) => {
  // Query to select log by ID
  const query = `
    SELECT id, device_id, timestamp, event_type, process_name, user_account, network_ip, raw_data, created_at
    FROM logs
    WHERE id = $1
  `;

  // Execute query and return log entry or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};