// Import database connection pool
import db from "../db/db.js";

// Service function to fetch dashboard summary statistics
export const fetchDashboardSummary = async () => {
  // Query to count total devices
  const devicesResult = await db.query(`SELECT COUNT(*)::int AS count FROM devices`);
  // Query to count logs from the last 24 hours
  const logsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
  `);
  // Query to count unresolved alerts
  const alertsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM alerts
    WHERE status != 'resolved'
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
      DATE_TRUNC('hour', timestamp) AS hour,
      COUNT(*)::int AS event_count
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;

  // Execute query and return activity data
  const result = await db.query(query);
  return result.rows;
};