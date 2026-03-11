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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(100),
    generated_at TIMESTAMP,
    status VARCHAR(50),
    summary TEXT
);