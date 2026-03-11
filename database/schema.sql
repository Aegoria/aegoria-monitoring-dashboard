-- =========================================
-- Cybersecurity Monitoring Platform Schema
-- Minimal-change version compatible with:
-- - existing frontend endpoints
-- - existing scan/report backend flow
-- =========================================

-- Optional cleanup order for local reset
-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS devices CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DEVICES
-- Added because frontend already uses /devices
-- =========================================
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'online',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- AUDIT LOGS
-- Kept original fields and added device_id
-- so existing backend logic does not need a rewrite
-- =========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    device_id INT REFERENCES devices(id) ON DELETE SET NULL,
    machine_id VARCHAR(50),
    event_type VARCHAR(100),
    event_message TEXT,
    event_time TIMESTAMP,
    severity VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_device_id ON audit_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_machine_id ON audit_logs(machine_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_time ON audit_logs(event_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- =========================================
-- ALERTS
-- Original structure preserved, with extra fields
-- required by the frontend alert model
-- =========================================
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    audit_id INT REFERENCES audit_logs(id) ON DELETE CASCADE,
    device_id INT REFERENCES devices(id) ON DELETE SET NULL,
    anomaly_score FLOAT,
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'open',
    title VARCHAR(150),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_audit_id ON alerts(audit_id);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- =========================================
-- REPORTS
-- Preserves original table, adds fields used by /report
-- =========================================
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(100),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    summary TEXT,
    risk_score FLOAT,
    risk_level VARCHAR(20),
    events_processed INT DEFAULT 0,
    system_health VARCHAR(20)
);

CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_risk_level ON reports(risk_level);