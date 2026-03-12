import db from "../db/db.js";

export const insertReport = async (data) => {
  const query = `
    INSERT INTO reports (
      report_name, generated_at, status, summary,
      risk_score, risk_level, detected_threats, correlation_findings,
      attack_timeline, recommendations, ai_analysis,
      event_distribution, pipeline_metrics
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  const values = [
    data.report_name || `report_${Date.now()}`,
    data.generated_at || new Date().toISOString(),
    data.status || "complete",
    data.summary || "",
    data.risk_score || 0,
    data.risk_level || "unknown",
    JSON.stringify(data.detected_threats || {}),
    JSON.stringify(data.correlation_findings || []),
    JSON.stringify(data.attack_timeline || {}),
    JSON.stringify(data.recommendations || []),
    JSON.stringify(data.ai_analysis || {}),
    JSON.stringify(data.event_distribution || {}),
    JSON.stringify(data.pipeline_metrics || {}),
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

export const fetchReports = async () => {
  const query = `
    SELECT id, report_name, generated_at, status, summary,
           risk_score, risk_level, detected_threats, correlation_findings,
           attack_timeline, recommendations, ai_analysis,
           event_distribution, pipeline_metrics
    FROM reports
    ORDER BY generated_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
};

export const fetchReportById = async (id) => {
  const query = `
    SELECT id, report_name, generated_at, status, summary,
           risk_score, risk_level, detected_threats, correlation_findings,
           attack_timeline, recommendations, ai_analysis,
           event_distribution, pipeline_metrics
    FROM reports
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};
