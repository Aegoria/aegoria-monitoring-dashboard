// Import database connection pool
import db from "../db/db.js";

// Service function to fetch dashboard summary statistics
export const fetchDashboardSummary = async () => {
  // Query to count distinct devices from audit_logs
  const devicesResult = await db.query(`SELECT COUNT(DISTINCT machine_id)::int AS count FROM audit_logs`);
  // Query to count logs from the last 24 hours
  const logsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM audit_logs
    WHERE event_time >= NOW() - INTERVAL '24 hours'
  `);
  // Query to count all alerts (since no status column)
  const alertsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM alerts
  `);

  // Return summary object with counts
  return {
    total_devices: devicesResult.rows[0].count,
    logs_last_24h: logsResult.rows[0].count,
    open_alerts: alertsResult.rows[0].count
  };
};

// Service function to fetch dashboard activity data (hourly log counts)
export const fetchDashboardActivity = async () => {
  // Query to aggregate log events by hour for the last 24 hours
  const query = `
    SELECT
      DATE_TRUNC('hour', event_time) AS hour,
      COUNT(*)::int AS event_count
    FROM audit_logs
    WHERE event_time >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;

  // Execute query and return activity data
  const result = await db.query(query);
  return result.rows;
};