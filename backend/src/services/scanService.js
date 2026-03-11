import db from "../db/db.js";

// Build a lightweight scan summary from the current database state, then
// persist the generated result in `reports` so `/report` can return it later.
export const runScan = async () => {
  const [eventsResult, alertsResult] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS count FROM audit_logs`),
    db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE severity IN ('critical', 'high'))::int AS high_risk
      FROM alerts
    `)
  ]);

  const eventsCollected = eventsResult.rows[0].count;
  const totalAlerts = alertsResult.rows[0].total;
  const highRiskAlerts = alertsResult.rows[0].high_risk;
  const riskScore = totalAlerts === 0 ? 0 : Number((highRiskAlerts / totalAlerts).toFixed(2));

  let riskLevel = "low";
  if (riskScore >= 0.75) {
    riskLevel = "high";
  } else if (riskScore >= 0.4) {
    riskLevel = "medium";
  }

  const reportSummary = `Scan analyzed ${eventsCollected} events and found ${totalAlerts} alerts.`;

  await db.query(
    `
      INSERT INTO reports (
        report_name,
        generated_at,
        status,
        summary,
        risk_score,
        risk_level,
        events_processed,
        system_health
      )
      VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)
    `,
    [
      "automated scan report",
      "scan complete",
      reportSummary,
      riskScore,
      riskLevel,
      eventsCollected,
      highRiskAlerts > 0 ? "degraded" : "healthy"
    ]
  );

  return {
    status: "scan complete",
    events_collected: eventsCollected,
    events_parsed: eventsCollected,
    events_analyzed: eventsCollected,
    risk_score: riskScore,
    risk_level: riskLevel,
    duration_ms: 0
  };
};

// Return the newest saved report and enrich it with a few live aggregates so
// the response matches the documented schema without requiring extra tables.
export const fetchLatestReport = async () => {
  const reportResult = await db.query(`
    SELECT
      generated_at AS timestamp,
      system_health,
      events_processed,
      risk_score,
      risk_level,
      summary
    FROM reports
    ORDER BY generated_at DESC
    LIMIT 1
  `);

  if (reportResult.rowCount === 0) {
    return {
      timestamp: new Date().toISOString(),
      system_health: "unknown",
      events_processed: 0,
      risk_score: 0,
      risk_level: "low",
      detected_threats: {
        failed_login_bursts: 0,
        privilege_escalations: 0,
        suspicious_processes: [],
        network_anomalies: []
      },
      correlation_findings: [],
      recommendations: []
    };
  }

  const [failedLogins, privilegeEscalations, suspiciousProcesses, networkAnomalies] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS count FROM alerts WHERE alert_type = 'failed_login_burst'`),
    db.query(`SELECT COUNT(*)::int AS count FROM alerts WHERE alert_type = 'privilege_escalation'`),
    db.query(`
      SELECT DISTINCT alert_type
      FROM alerts
      WHERE alert_type ILIKE '%process%'
      ORDER BY alert_type ASC
    `),
    db.query(`
      SELECT DISTINCT alert_type
      FROM alerts
      WHERE alert_type ILIKE '%network%'
      ORDER BY alert_type ASC
    `)
  ]);

  const report = reportResult.rows[0];

  return {
    timestamp: report.timestamp,
    system_health: report.system_health ?? "unknown",
    events_processed: report.events_processed ?? 0,
    risk_score: Number(report.risk_score ?? 0),
    risk_level: report.risk_level ?? "low",
    detected_threats: {
      failed_login_bursts: failedLogins.rows[0].count,
      privilege_escalations: privilegeEscalations.rows[0].count,
      suspicious_processes: suspiciousProcesses.rows.map((row) => row.alert_type),
      network_anomalies: networkAnomalies.rows.map((row) => row.alert_type)
    },
    correlation_findings: report.summary ? [report.summary] : [],
    recommendations: [
      "Review high-severity alerts first",
      "Validate affected devices and linked audit events"
    ]
  };
};
