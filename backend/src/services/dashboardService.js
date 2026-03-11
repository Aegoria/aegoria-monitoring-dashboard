// Import database connection pool
import db from "../db/db.js";

// The summary endpoint follows the OpenAPI response shape and counts directly
// from the tables introduced in the new schema.
export const fetchDashboardSummary = async () => {
  const [devicesResult, logsResult, alertsResult] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS count FROM devices`),
    db.query(`SELECT COUNT(*)::int AS count FROM audit_logs`),
    db.query(`SELECT COUNT(*)::int AS count FROM alerts`)
  ]);

  return {
    total_devices: devicesResult.rows[0].count,
    total_logs: logsResult.rows[0].count,
    total_alerts: alertsResult.rows[0].count
  };
};

// Activity is returned as `{ activity: [...] }` to match Swagger exactly.
export const fetchDashboardActivity = async () => {
  const query = `
    SELECT
      DATE_TRUNC('hour', al.event_time) AS timestamp,
      'log' AS type,
      CONCAT('Events recorded in hour starting ', TO_CHAR(DATE_TRUNC('hour', al.event_time), 'YYYY-MM-DD HH24:MI')) AS label,
      COUNT(*)::int AS value
    FROM audit_logs al
    WHERE al.event_time >= NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', al.event_time)
    ORDER BY timestamp ASC
  `;

  const result = await db.query(query);
  return { activity: result.rows };
};
