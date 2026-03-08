// Import database connection pool
import db from "../db/db.js";

// Service function to fetch logs with optional filters
export const fetchLogs = async (filters = {}) => {
  // Arrays to build dynamic WHERE conditions and parameter values
  const conditions = [];
  const values = [];

  // Add device_id filter if provided (mapped to machine_id)
  if (filters.device_id) {
    values.push(filters.device_id);
    conditions.push(`machine_id = $${values.length}`);
  }

  // Add event_type filter if provided
  if (filters.event_type) {
    values.push(filters.event_type);
    conditions.push(`event_type = $${values.length}`);
  }

  // Add start timestamp filter if provided (mapped to event_time)
  if (filters.start) {
    values.push(filters.start);
    conditions.push(`event_time >= $${values.length}`);
  }

  // Add end timestamp filter if provided (mapped to event_time)
  if (filters.end) {
    values.push(filters.end);
    conditions.push(`event_time <= $${values.length}`);
  }

  // Base query to select log fields from audit_logs
  let query = `
    SELECT id, machine_id as device_id, event_time as timestamp, event_type, user_id as user_account, event_message as raw_data, event_time as created_at
    FROM audit_logs
  `;

  // Add WHERE clause if any conditions exist
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  // Order by event_time, most recent first
  query += ` ORDER BY event_time DESC`;

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
  // Query to select log by ID from audit_logs
  const query = `
    SELECT id, machine_id as device_id, event_time as timestamp, event_type, user_id as user_account, event_message as raw_data, event_time as created_at
    FROM audit_logs
    WHERE id = $1
  `;

  // Execute query and return log entry or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};