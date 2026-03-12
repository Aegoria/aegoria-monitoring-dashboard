-- Migration 001: Add AI enrichment columns and expand reports table
-- Run this against an existing database to add the new columns.
-- These are safe to run multiple times (uses IF NOT EXISTS pattern via DO blocks).

-- Add new columns to alerts table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='ai_threat_score') THEN
        ALTER TABLE alerts ADD COLUMN ai_threat_score FLOAT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='ai_threat_classification') THEN
        ALTER TABLE alerts ADD COLUMN ai_threat_classification VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='confidence_score') THEN
        ALTER TABLE alerts ADD COLUMN confidence_score FLOAT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='status') THEN
        ALTER TABLE alerts ADD COLUMN status VARCHAR(20) DEFAULT 'open';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='mitre_technique') THEN
        ALTER TABLE alerts ADD COLUMN mitre_technique VARCHAR(50);
    END IF;
END $$;

-- Add new columns to reports table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='risk_score') THEN
        ALTER TABLE reports ADD COLUMN risk_score INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='risk_level') THEN
        ALTER TABLE reports ADD COLUMN risk_level VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='detected_threats') THEN
        ALTER TABLE reports ADD COLUMN detected_threats JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='correlation_findings') THEN
        ALTER TABLE reports ADD COLUMN correlation_findings JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='attack_timeline') THEN
        ALTER TABLE reports ADD COLUMN attack_timeline JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='recommendations') THEN
        ALTER TABLE reports ADD COLUMN recommendations JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='ai_analysis') THEN
        ALTER TABLE reports ADD COLUMN ai_analysis JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='event_distribution') THEN
        ALTER TABLE reports ADD COLUMN event_distribution JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='pipeline_metrics') THEN
        ALTER TABLE reports ADD COLUMN pipeline_metrics JSONB;
    END IF;
END $$;
