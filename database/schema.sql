CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    machine_id VARCHAR(50),
    event_type VARCHAR(100),
    event_message TEXT,
    event_time TIMESTAMP,
    severity VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    audit_id INT REFERENCES audit_logs(id) ON DELETE CASCADE,
    anomaly_score FLOAT,
    alert_type VARCHAR(50),
    description TEXT,
    ai_threat_score FLOAT,
    ai_threat_classification VARCHAR(100),
    confidence_score FLOAT,
    status VARCHAR(20) DEFAULT 'open',
    mitre_technique VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(100),
    generated_at TIMESTAMP,
    status VARCHAR(50),
    summary TEXT,
    risk_score INT,
    risk_level VARCHAR(20),
    detected_threats JSONB,
    correlation_findings JSONB,
    attack_timeline JSONB,
    recommendations JSONB,
    ai_analysis JSONB,
    event_distribution JSONB,
    pipeline_metrics JSONB
);
