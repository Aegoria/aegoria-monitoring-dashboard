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
    SELECT a.id, al.machine_id as device_id, a.anomaly_score as severity, a.alert_type as title,
           a.description, a.created_at, a.ai_threat_score, a.ai_threat_classification,
           a.confidence_score, a.status, a.mitre_technique
    FROM alerts a
    LEFT JOIN audit_logs al ON a.audit_id = al.id
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
    SELECT a.id, al.machine_id as device_id, a.anomaly_score as severity, a.alert_type as title,
           a.description, a.created_at, a.ai_threat_score, a.ai_threat_classification,
           a.confidence_score, a.status, a.mitre_technique
    FROM alerts a
    LEFT JOIN audit_logs al ON a.audit_id = al.id
    WHERE a.id = $1
  `;

  // Execute query and return first row or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

// Service function to change the status of an alert
export const changeAlertStatus = async (id, status) => {
  const query = `
    UPDATE alerts SET status = $2 WHERE id = $1
    RETURNING a.id, a.anomaly_score as severity, a.alert_type as title,
              a.description, a.status, a.created_at
  `;
  try {
    const result = await db.query(
      `UPDATE alerts SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch {
    // Fallback if status column doesn't exist yet
    return await fetchAlertById(id);
  }
};

// Service function to insert a new alert (from AI model)
export const insertAlert = async (data) => {
  const query = `
    INSERT INTO alerts (
      audit_id, anomaly_score, alert_type, description,
      ai_threat_score, ai_threat_classification, confidence_score,
      status, mitre_technique
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const values = [
    data.audit_id || null,
    data.anomaly_score || data.final_score || 0,
    data.alert_type || data.source || "AI_ALERT",
    data.description || data.entity_name || "",
    data.ai_threat_score || null,
    data.ai_threat_classification || null,
    data.confidence_score || null,
    data.status || "open",
    data.mitre_technique || (data.techniques && data.techniques[0]) || null,
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};