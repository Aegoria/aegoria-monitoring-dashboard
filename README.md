# aegoria-monitoring-dashboard

the visualization and persistence layer of aegoria. this is where security reports land, get stored in a database, and become something analysts can actually look at.

a React frontend connected to an Express backend connected to PostgreSQL. it shows risk scores, alert timelines, AI analysis results, event distributions, and recommendations — all populated from the upstream pipeline.

---

## what this does

- **stores** combined security reports (rust telemetry + AI analysis) in PostgreSQL
- **displays** risk scores, threat classifications, alert severity breakdowns, and attack timelines
- **provides** a REST API for ingesting reports, querying alerts, and checking system health
- **monitors** the status of all aegoria services (rust engine, AI service, database)

it's the part of aegoria that a security analyst actually interacts with.

---

## how it fits into aegoria

this is the last stop in the pipeline:

```
pipeline orchestrator
  → POST /reports (combined rust + AI report)
  → PostgreSQL storage
  → frontend fetches from /reports, /alerts, /system/status
  → analyst sees the results
```

the dashboard doesn't run any detection logic. it receives finished reports from the pipeline orchestrator and makes them accessible through a web interface and API.

---

## key components

### backend (`backend/`)

Express.js API server running on port 3001.

| endpoint | method | description |
|---|---|---|
| `/reports` | POST | store a combined security report |
| `/reports` | GET | list all stored reports |
| `/reports/:id` | GET | get a specific report with full data |
| `/alerts` | GET | list alerts with optional severity/device filters |
| `/alerts` | POST | create a new alert (from AI model) |
| `/alerts/:id/status` | PATCH | update alert status |
| `/system/status` | GET | health check for all aegoria services |
| `/logs` | GET | query audit logs |
| `/devices` | GET | list monitored devices |
| `/dashboard/summary` | GET | KPI summary (device count, log count, alert count) |

### frontend (`frontend/`)

React 19 + Tailwind CSS dashboard with dark mode.

| page | what it shows |
|---|---|
| dashboard | risk score, system health, AI analysis summary, event distribution chart |
| alerts | alert table with severity, AI scores, MITRE techniques, status, detail panel |
| logs | audit log browser with filtering |
| devices | monitored device list |
| settings | placeholder configuration page |

### database (`database/`)

PostgreSQL with four tables: `users`, `audit_logs`, `alerts`, `reports`.

the `reports` table stores the full pipeline output as JSONB — detected threats, attack timeline, AI analysis, event distribution, recommendations. the `alerts` table includes AI enrichment fields (threat score, classification, confidence, MITRE technique).

---

## quick start

```bash
# 1. set up the database
createdb monitoring_db
psql monitoring_db < database/schema.sql
psql monitoring_db < database/seed_data.sql    # optional: sample data

# 2. start the backend
cd backend
cp .env.example .env    # or create .env with DB_USER, DB_NAME, etc.
npm install
npm run dev             # starts on port 3001

# 3. start the frontend
cd frontend
npm install
npm run dev             # starts on port 5173
```

if you need to apply the schema changes to an existing database:

```bash
psql monitoring_db < database/migrate_001.sql
```

---

## tech

- React 19, Vite, Tailwind CSS 4
- Node.js, Express
- PostgreSQL with JSONB columns for flexible report storage
- Axios for API communication
