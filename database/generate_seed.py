# Just for testing purposes, not to be used in production
# This script generates a seed_data.sql file with dummy data for:
# - users
# - devices
# - audit_logs
# - alerts
# - reports
#
# It matches the updated database schema:
#
# users(
#   id, username, email, role, created_at
# )
#
# devices(
#   id, name, ip_address, status, created_at
# )
#
# audit_logs(
#   id, user_id, device_id, machine_id, event_type,
#   event_message, event_time, severity, created_at
# )
#
# alerts(
#   id, audit_id, device_id, anomaly_score, alert_type,
#   severity, status, title, description, created_at
# )
#
# reports(
#   id, report_name, generated_at, status, summary,
#   risk_score, risk_level, events_processed, system_health
# )

from pathlib import Path
from random import choice, randint, random
from datetime import datetime, timedelta
import json

# Path to output SQL file
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = BASE_DIR / "seed_data.sql"

# ============================================================
# Constants used to generate realistic test data
# ============================================================

ROLES = ["admin", "analyst", "operator", "viewer"]

SEVERITIES = ["low", "medium", "high", "critical"]
ALERT_LEVELS = ["info", "warning", "high", "critical"]
ALERT_STATUSES = ["open", "open", "open", "resolved"]  # weighted toward open
MODEL_SOURCES = ["primary", "secondary"]

DEVICE_STATUSES = ["online", "online", "online", "offline", "maintenance"]

OS_TYPES = ["Windows", "Linux", "macOS"]
WINDOWS_VERSIONS = ["10", "11", "Server 2019", "Server 2022"]
LINUX_VERSIONS = ["Ubuntu 22.04", "Debian 12", "CentOS 9", "RHEL 9"]
MAC_VERSIONS = ["13 Ventura", "14 Sonoma"]

AGENT_VERSIONS = ["1.0.2", "1.1.0", "1.2.4", "2.0.1"]

EVENT_TYPES = [
    "login_success",
    "login_failed",
    "process_creation",
    "process_termination",
    "service_install",
    "service_change",
    "file_access",
    "network_connection",
    "privilege_escalation",
    "config_change",
]

EVENT_CATEGORIES = {
    "login_success": "authentication",
    "login_failed": "authentication",
    "process_creation": "process",
    "process_termination": "process",
    "service_install": "service",
    "service_change": "service",
    "file_access": "file",
    "network_connection": "network",
    "privilege_escalation": "privilege",
    "config_change": "configuration",
}

PROCESS_NAMES = [
    "chrome.exe", "powershell.exe", "cmd.exe", "explorer.exe",
    "ssh", "systemd", "nginx", "python.exe", "node.exe",
    "svchost.exe", "lsass.exe", "reg.exe", "sc.exe"
]

PARENT_PROCESSES = [
    "explorer.exe", "services.exe", "systemd", "cmd.exe", "powershell.exe"
]

SERVICE_NAMES = [
    "W32Time", "Spooler", "WinDefend", "sshd", "nginx", "postgresql", "docker"
]

REGISTRY_KEYS = [
    r"HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run",
    r"HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services",
    r"HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run",
]

ACTIONS = ["allowed", "blocked", "modified", "created", "deleted", "executed"]
PRIVILEGE_LEVELS = ["user", "power_user", "administrator", "system"]

MITRE_PAIRS = [
    ("T1078", "Valid Accounts", "Initial Access"),
    ("T1059", "Command and Scripting Interpreter", "Execution"),
    ("T1047", "Windows Management Instrumentation", "Execution"),
    ("T1055", "Process Injection", "Defense Evasion"),
    ("T1068", "Exploitation for Privilege Escalation", "Privilege Escalation"),
    ("T1547", "Boot or Logon Autostart Execution", "Persistence"),
    ("T1021", "Remote Services", "Lateral Movement"),
    ("T1041", "Exfiltration Over C2 Channel", "Exfiltration"),
    ("T1110", "Brute Force", "Credential Access"),
    ("T1562", "Impair Defenses", "Defense Evasion"),
]

DETECTION_RULES = [
    "Excessive Failed Logins",
    "Suspicious PowerShell Invocation",
    "Outbound Connection to Rare IP",
    "Unauthorized Service Installation",
    "Registry Persistence Key Modified",
    "Privilege Escalation Sequence",
    "Sensitive File Access Pattern",
    "Configuration Drift Detected",
    "Known Benign Activity",
]

REPORT_STATUSES = ["generated", "pending", "failed"]

FIRST_NAMES = [
    "Alice", "Bob", "Charlie", "David", "Emma", "Farah", "George", "Hugo",
    "Ines", "Jules", "Karim", "Lina", "Maya", "Nora", "Oscar", "Paul",
    "Quentin", "Rania", "Sami", "Thomas", "Yanis", "Zoe"
]

LAST_NAMES = [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit",
    "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Garcia",
    "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel"
]

# ============================================================
# Small helper functions
# ============================================================

def sql_escape(value: str) -> str:
    """Escape single quotes for safe SQL string generation."""
    return value.replace("'", "''")


def ts(dt: datetime) -> str:
    """Format datetime into SQL timestamp format."""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def random_past_datetime(days_back: int = 30) -> datetime:
    """Generate a random datetime in the past."""
    now = datetime.now()
    delta = timedelta(
        days=randint(0, days_back),
        hours=randint(0, 23),
        minutes=randint(0, 59),
        seconds=randint(0, 59),
    )
    return now - delta


# ============================================================
# Data generation helpers
# ============================================================

def make_username(first_name: str, last_name: str, index: int) -> str:
    """Create a username from first name, last name, and an index."""
    return f"{first_name.lower()}.{last_name.lower()}{index}"


def make_email(username: str) -> str:
    """Create a test email from a username."""
    return f"{username}@monitoring.local"


def make_hostname(os_type: str) -> str:
    """Create a hostname based on the OS type."""
    prefix = {"Windows": "WIN", "Linux": "LNX", "macOS": "MAC"}[os_type]
    return f"{prefix}-{randint(1000, 9999)}"


def make_os_version(os_type: str) -> str:
    """Pick a realistic OS version for the given OS family."""
    if os_type == "Windows":
        return choice(WINDOWS_VERSIONS)
    if os_type == "Linux":
        return choice(LINUX_VERSIONS)
    return choice(MAC_VERSIONS)


def make_ip(private: bool = True) -> str:
    """Generate either a private or public-looking IP address."""
    if private:
        return f"10.{randint(0,255)}.{randint(0,255)}.{randint(1,254)}"
    return f"{randint(11,223)}.{randint(0,255)}.{randint(0,255)}.{randint(1,254)}"


def make_file_path(os_type: str) -> str:
    """Generate a plausible file path based on the OS type."""
    if os_type == "Windows":
        return choice([
            r"C:\Windows\System32\drivers\etc\hosts",
            r"C:\Users\Public\Downloads\tool.exe",
            r"C:\ProgramData\app\config.ini",
            r"C:\Temp\payload.ps1",
        ])
    return choice([
        "/etc/passwd",
        "/var/log/auth.log",
        "/opt/app/config.yaml",
        "/tmp/script.sh",
    ])


def make_hash() -> str:
    """Generate a fake SHA256-like hexadecimal hash."""
    chars = "abcdef0123456789"
    return "".join(choice(chars) for _ in range(64))


def infer_alert_level(score: float) -> str:
    """Convert anomaly score into a coarse alert level."""
    if score >= 0.9:
        return "critical"
    if score >= 0.75:
        return "high"
    if score >= 0.5:
        return "warning"
    return "info"


def infer_severity(event_type: str, anomaly_score: float) -> str:
    """Infer log/alert severity from event type and anomaly score."""
    if event_type in {"privilege_escalation", "service_install"} and anomaly_score > 0.7:
        return "critical"
    if event_type in {"login_failed", "config_change", "network_connection"} and anomaly_score > 0.6:
        return "high"
    if anomaly_score > 0.4:
        return "medium"
    return "low"


def infer_risk_level(score: float) -> str:
    """Convert numeric risk score into the risk label used by reports."""
    if score >= 0.85:
        return "critical"
    if score >= 0.65:
        return "high"
    if score >= 0.40:
        return "medium"
    return "low"


# ============================================================
# Users generation
# ============================================================

def generate_users(count: int = 25):
    """
    Generate fake users.

    IDs are assigned manually here so we can reference them consistently
    when generating logs.
    """
    users = []
    for i in range(1, count + 1):
        first = choice(FIRST_NAMES)
        last = choice(LAST_NAMES)
        username = make_username(first, last, i)
        users.append({
            "id": i,
            "username": username,
            "email": make_email(username),
            "role": choice(ROLES),
            "created_at": random_past_datetime(180),
        })
    return users


# ============================================================
# Devices generation
# ============================================================

def generate_devices(count: int = 40):
    """
    Generate monitored devices.

    We store:
    - database integer ID
    - display name (used in devices.name)
    - machine_id (used in audit_logs.machine_id for backward compatibility)
    """
    devices = []
    for i in range(1, count + 1):
        os_type = choice(OS_TYPES)
        hostname = make_hostname(os_type)

        devices.append({
            "id": i,
            "name": hostname,
            "machine_id": f"dev-{i:03d}",
            "ip_address": make_ip(private=True),
            "status": choice(DEVICE_STATUSES),
            "created_at": random_past_datetime(120),
            "os_type": os_type,
            "os_version": make_os_version(os_type),
        })
    return devices


# ============================================================
# Event building
# ============================================================

def build_event_payload(user, device):
    """
    Build a rich event payload that will be stored as JSON in event_message.

    Even though the database only stores a few top-level columns for logs,
    we keep detailed event data in the JSON field so your backend can still
    expose rich information later if needed.
    """
    os_type = device["os_type"]
    event_type = choice(EVENT_TYPES)
    event_category = EVENT_CATEGORIES[event_type]
    anomaly_score = round(random(), 2)

    mitre_technique, detection_rule, mitre_tactic = None, None, None

    suspicious = (
        anomaly_score > 0.72
        or event_type in {"login_failed", "privilege_escalation", "service_install"}
    )

    if suspicious:
        technique_id, technique_name, tactic = choice(MITRE_PAIRS)
        mitre_technique = f"{technique_id} - {technique_name}"
        mitre_tactic = tactic
        detection_rule = choice(DETECTION_RULES)
    else:
        detection_rule = "Known Benign Activity"

    source_ip = make_ip(private=True)
    destination_ip = make_ip(private=False if suspicious else True)

    login_attempt_count = randint(1, 8) if event_type == "login_failed" else 1
    login_status = "failed" if event_type == "login_failed" else (
        "success" if event_type == "login_success" else None
    )

    process_name = choice(PROCESS_NAMES)
    parent_process = choice(PARENT_PROCESSES)
    privilege_level = choice(PRIVILEGE_LEVELS)

    # Force some event types to be more suspicious
    if event_type == "privilege_escalation":
        privilege_level = choice(["administrator", "system"])
        anomaly_score = round(max(anomaly_score, 0.80), 2)

    if event_type == "service_install":
        anomaly_score = round(max(anomaly_score, 0.70), 2)

    if event_type == "login_failed" and login_attempt_count >= 5:
        anomaly_score = round(max(anomaly_score, 0.78), 2)

    alert_level = infer_alert_level(anomaly_score)
    event_severity = infer_severity(event_type, anomaly_score)

    payload = {
        "device_id": device["id"],            # database FK for audit_logs.device_id
        "machine_id": device["machine_id"],   # legacy identifier kept in audit_logs.machine_id
        "user_id": user["id"],
        "hostname": device["name"],
        "os_type": os_type,
        "os_version": device["os_version"],
        "agent_version": choice(AGENT_VERSIONS),
        "timestamp": ts(random_past_datetime(45)),
        "event_type": event_type,
        "event_category": event_category,
        "process_name": process_name if event_category in {"process", "network", "privilege", "configuration", "service"} else None,
        "process_id": randint(100, 12000),
        "parent_process": parent_process,
        "command_line": f"{process_name} --run {'--encoded' if suspicious else '--normal'}",
        "username": user["username"],
        "session_id": f"sess-{randint(100000, 999999)}",
        "source_ip": source_ip,
        "destination_ip": destination_ip,
        "source_port": randint(1024, 65535),
        "destination_port": choice([22, 53, 80, 443, 3389, 5432, 8080]),
        "protocol": choice(["TCP", "UDP"]),
        "privilege_level": privilege_level,
        "action_type": choice(ACTIONS),
        "file_path": make_file_path(os_type),
        "file_hash": make_hash(),
        "service_name": choice(SERVICE_NAMES),
        "registry_key": choice(REGISTRY_KEYS) if os_type == "Windows" else None,
        "login_status": login_status,
        "login_attempt_count": login_attempt_count,
        "network_bytes_sent": randint(100, 500000),
        "network_bytes_received": randint(100, 900000),
        "anomaly_score": anomaly_score,
        "alert_level": alert_level,
        "model_source": choice(MODEL_SOURCES),
        "detection_rule": detection_rule,
        "mitre_technique": mitre_technique,
        "mitre_tactic": mitre_tactic,
        "event_severity": event_severity,
    }

    return payload


def summarize_event(payload):
    """Create a human-readable message for each event."""
    event_type = payload["event_type"]
    username = payload["username"]
    host = payload["hostname"]

    if event_type == "login_success":
        return f"Successful login by {username} on {host} from {payload['source_ip']}."
    if event_type == "login_failed":
        return f"Failed login by {username} on {host} from {payload['source_ip']} after {payload['login_attempt_count']} attempt(s)."
    if event_type == "process_creation":
        return f"Process {payload['process_name']} created on {host} by {username}."
    if event_type == "process_termination":
        return f"Process {payload['process_name']} terminated on {host}."
    if event_type == "service_install":
        return f"Service {payload['service_name']} installed on {host}."
    if event_type == "service_change":
        return f"Service {payload['service_name']} modified on {host}."
    if event_type == "file_access":
        return f"File {payload['file_path']} accessed by {username} on {host}."
    if event_type == "network_connection":
        return f"Network connection from {payload['source_ip']} to {payload['destination_ip']}:{payload['destination_port']} on {host}."
    if event_type == "privilege_escalation":
        return f"Privilege escalation suspected for {username} on {host}."
    return f"Configuration changed on {host} by {username}."


# ============================================================
# Audit logs generation
# ============================================================

def generate_audit_logs(users, devices, count: int = 700):
    """
    Generate audit log rows.

    Important mapping to the new schema:
    - device_id goes into audit_logs.device_id
    - machine_id is still kept for compatibility with older logic
    - event_message contains rich JSON with both summary and details
    """
    logs = []
    for i in range(1, count + 1):
        user = choice(users)
        device = choice(devices)

        payload = build_event_payload(user, device)
        event_time = datetime.strptime(payload["timestamp"], "%Y-%m-%d %H:%M:%S")
        summary = summarize_event(payload)

        event_message = json.dumps({
            "summary": summary,
            "details": payload
        }, ensure_ascii=False)

        logs.append({
            "id": i,
            "user_id": user["id"],
            "device_id": device["id"],
            "machine_id": device["machine_id"],
            "event_type": payload["event_type"],
            "event_message": event_message,
            "event_time": event_time,
            "severity": payload["event_severity"],
            "payload": payload,
        })
    return logs


# ============================================================
# Alerts generation
# ============================================================

def make_alert_title(payload):
    """Create a short title for the alert row."""
    mapping = {
        "login_failed": "Suspicious login activity",
        "privilege_escalation": "Privilege escalation detected",
        "service_install": "Unauthorized service installation",
        "network_connection": "Suspicious network connection",
        "config_change": "Configuration drift detected",
        "file_access": "Sensitive file access pattern",
        "process_creation": "Suspicious process creation",
        "process_termination": "Unusual process termination",
        "service_change": "Unexpected service change",
        "login_success": "Authentication anomaly detected",
    }
    return mapping.get(payload["event_type"], "Security alert detected")


def generate_alerts(audit_logs, count: int = 140):
    """
    Generate alerts from suspicious audit logs.

    New schema fields included:
    - device_id
    - severity
    - status
    - title
    """
    suspicious_logs = [
        log for log in audit_logs
        if log["payload"]["anomaly_score"] >= 0.60
        or log["event_type"] in {"login_failed", "privilege_escalation", "service_install"}
    ]

    alerts = []
    for i in range(1, count + 1):
        log = choice(suspicious_logs)
        p = log["payload"]
        created_at = log["event_time"] + timedelta(minutes=randint(1, 90))

        description = (
            f"{p['alert_level'].upper()} alert for {p['event_type']} on {p['hostname']} "
            f"(user={p['username']}, score={p['anomaly_score']}, model={p['model_source']}, "
            f"rule={p['detection_rule']})"
        )

        alerts.append({
            "id": i,
            "audit_id": log["id"],
            "device_id": log["device_id"],
            "anomaly_score": p["anomaly_score"],
            "alert_type": p["alert_level"],
            "severity": p["event_severity"],
            "status": choice(ALERT_STATUSES),
            "title": make_alert_title(p),
            "description": description,
            "created_at": created_at,
        })
    return alerts


# ============================================================
# Reports generation
# ============================================================

def generate_reports(audit_logs, alerts, count: int = 20):
    """
    Generate reports using information derived from logs and alerts.

    New schema fields included:
    - risk_score
    - risk_level
    - events_processed
    - system_health
    """
    names = [
        "Daily Security Activity",
        "Authentication Events Review",
        "Process Activity Summary",
        "Suspicious Network Connections",
        "Privilege Escalation Watchlist",
        "Service Change Audit",
        "File Access Monitoring",
        "Configuration Drift Overview",
        "MITRE Mapping Summary",
        "Threat Detection Overview",
        "SOC Triage Snapshot",
        "Device Health Overview",
        "Endpoint Activity Report",
        "Critical Alerts Digest",
        "Weekly Executive Summary",
        "Infrastructure Security Report",
        "Alert Volume Trend",
        "Detection Rule Performance",
        "Model Pipeline Overview",
        "Incident Review Pack",
    ]

    reports = []

    high_or_critical_alerts = sum(
        1 for a in alerts if a["severity"] in {"high", "critical"}
    )

    avg_anomaly = (
        sum(log["payload"]["anomaly_score"] for log in audit_logs) / len(audit_logs)
        if audit_logs else 0.0
    )

    # Slightly boost risk score if there are many serious alerts
    risk_score_base = min(1.0, round(avg_anomaly + (high_or_critical_alerts / max(len(alerts), 1)) * 0.35, 2))
    risk_level = infer_risk_level(risk_score_base)

    for i in range(1, count + 1):
        name = names[i - 1]
        status = choice(REPORT_STATUSES)
        events_processed = randint(max(10, len(audit_logs) // 4), len(audit_logs))
        system_health = "healthy" if status != "failed" else "degraded"

        if status == "generated":
            summary = (
                f"{name} generated successfully. "
                f"{high_or_critical_alerts} high-priority alert(s) observed across {events_processed} processed event(s)."
            )
        elif status == "pending":
            summary = f"{name} is still pending and may contain partial results."
        else:
            summary = f"{name} failed to generate completely. Review pipeline or ingestion services."

        reports.append({
            "id": i,
            "report_name": name,
            "generated_at": random_past_datetime(20),
            "status": status,
            "summary": summary,
            "risk_score": risk_score_base,
            "risk_level": risk_level,
            "events_processed": events_processed,
            "system_health": system_health,
        })

    return reports


# ============================================================
# SQL builder
# ============================================================

def build_sql(users, devices, audit_logs, alerts, reports):
    """
    Build the final SQL seed script.

    Order matters because of foreign keys:
    1. users
    2. devices
    3. audit_logs
    4. alerts
    5. reports
    """
    lines = []
    lines.append("-- Auto-generated by generate_seed.py")
    lines.append("-- Seed data for the updated cybersecurity monitoring schema")
    lines.append("")

    # TRUNCATE order is important because of FK relationships
    lines.append("TRUNCATE TABLE alerts, audit_logs, reports, devices, users RESTART IDENTITY CASCADE;")
    lines.append("")

    # ------------------------------------------------------------
    # Users
    # ------------------------------------------------------------
    lines.append("INSERT INTO users (username, email, role, created_at) VALUES")
    user_rows = []
    for u in users:
        user_rows.append(
            f"('{sql_escape(u['username'])}', '{sql_escape(u['email'])}', "
            f"'{sql_escape(u['role'])}', '{ts(u['created_at'])}')"
        )
    lines.append(",\n".join(user_rows) + ";")
    lines.append("")

    # ------------------------------------------------------------
    # Devices
    # ------------------------------------------------------------
    lines.append("INSERT INTO devices (name, ip_address, status, created_at) VALUES")
    device_rows = []
    for d in devices:
        device_rows.append(
            f"('{sql_escape(d['name'])}', '{sql_escape(d['ip_address'])}', "
            f"'{sql_escape(d['status'])}', '{ts(d['created_at'])}')"
        )
    lines.append(",\n".join(device_rows) + ";")
    lines.append("")

    # ------------------------------------------------------------
    # Audit logs
    # ------------------------------------------------------------
    lines.append("INSERT INTO audit_logs (user_id, device_id, machine_id, event_type, event_message, event_time, severity, created_at) VALUES")
    audit_rows = []
    for a in audit_logs:
        audit_rows.append(
            f"({a['user_id']}, {a['device_id']}, '{sql_escape(a['machine_id'])}', "
            f"'{sql_escape(a['event_type'])}', '{sql_escape(a['event_message'])}', "
            f"'{ts(a['event_time'])}', '{sql_escape(a['severity'])}', '{ts(a['event_time'])}')"
        )
    lines.append(",\n".join(audit_rows) + ";")
    lines.append("")

    # ------------------------------------------------------------
    # Alerts
    # ------------------------------------------------------------
    lines.append("INSERT INTO alerts (audit_id, device_id, anomaly_score, alert_type, severity, status, title, description, created_at) VALUES")
    alert_rows = []
    for a in alerts:
        alert_rows.append(
            f"({a['audit_id']}, {a['device_id']}, {a['anomaly_score']}, "
            f"'{sql_escape(a['alert_type'])}', '{sql_escape(a['severity'])}', "
            f"'{sql_escape(a['status'])}', '{sql_escape(a['title'])}', "
            f"'{sql_escape(a['description'])}', '{ts(a['created_at'])}')"
        )
    lines.append(",\n".join(alert_rows) + ";")
    lines.append("")

    # ------------------------------------------------------------
    # Reports
    # ------------------------------------------------------------
    lines.append("INSERT INTO reports (report_name, generated_at, status, summary, risk_score, risk_level, events_processed, system_health) VALUES")
    report_rows = []
    for r in reports:
        report_rows.append(
            f"('{sql_escape(r['report_name'])}', '{ts(r['generated_at'])}', "
            f"'{sql_escape(r['status'])}', '{sql_escape(r['summary'])}', "
            f"{r['risk_score']}, '{sql_escape(r['risk_level'])}', "
            f"{r['events_processed']}, '{sql_escape(r['system_health'])}')"
        )
    lines.append(",\n".join(report_rows) + ";")
    lines.append("")

    return "\n".join(lines)


# ============================================================
# Main entry point
# ============================================================

def main():
    """
    Main function:
    - generates fake data
    - converts it into SQL INSERT statements
    - writes everything into seed_data.sql
    """
    users = generate_users(25)
    devices = generate_devices(40)
    audit_logs = generate_audit_logs(users, devices, 700)
    alerts = generate_alerts(audit_logs, 140)
    reports = generate_reports(audit_logs, alerts, 20)

    sql_content = build_sql(users, devices, audit_logs, alerts, reports)
    OUTPUT_FILE.write_text(sql_content, encoding="utf-8")

    print(f"Generated: {OUTPUT_FILE}")
    print(f"Users: {len(users)}")
    print(f"Devices: {len(devices)}")
    print(f"Audit logs: {len(audit_logs)}")
    print(f"Alerts: {len(alerts)}")
    print(f"Reports: {len(reports)}")


if __name__ == "__main__":
    main()