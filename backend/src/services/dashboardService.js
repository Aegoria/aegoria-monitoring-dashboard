import db from "../db/db.js";

export const fetchDashboardSummary = async () => {
  const devicesResult = await db.query(`SELECT COUNT(*)::int AS count FROM devices`);
  const logsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
  `);
  const alertsResult = await db.query(`
    SELECT COUNT(*)::int AS count
    FROM alerts
    WHERE status != 'resolved'
  `);

  return {
    total_devices: devicesResult.rows[0].count,
    logs_last_24h: logsResult.rows[0].count,
    open_alerts: alertsResult.rows[0].count
  };
};

export const fetchDashboardActivity = async () => {
  const query = `
    SELECT
      DATE_TRUNC('hour', timestamp) AS hour,
      COUNT(*)::int AS event_count
    FROM logs
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour ASC
  `;

  const result = await db.query(query);
  return result.rows;
};