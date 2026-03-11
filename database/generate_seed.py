# Just for testing purposes, not to be used in production
# This script generates a seed.sql file with some dummy data for the users table.

from pathlib import Path
from random import choice, randint, random
from datetime import datetime, timedelta
import json

# Path to output SQL file
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = BASE_DIR / "seed_data.sql"

# Define constants for random data generation
ROLES = ["admin", "analyst", "operator", "viewer"]

# These are used for both audit_logs and alerts to maintain consistency
SEVERITIES = ["low", "medium", "high", "critical"]
ALERT_LEVELS = ["info", "warning", "high", "critical"]
MODEL_SOURCES = ["primary", "secondary"]

# For audit log generation
OS_TYPES = ["Windows", "Linux", "macOS"]
WINDOWS_VERSIONS = ["10", "11", "Server 2019", "Server 2022"]
LINUX_VERSIONS = ["Ubuntu 22.04", "Debian 12", "CentOS 9", "RHEL 9"]
MAC_VERSIONS = ["13 Ventura", "14 Sonoma"]

# Agent versions for event payloads
AGENT_VERSIONS = ["1.0.2", "1.1.0", "1.2.4", "2.0.1"]

# Event types and categories for audit logs
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

# Mapping of event types to broader categories for better organization
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

# Common process names for process creation events
PROCESS_NAMES = [
    "chrome.exe", "powershell.exe", "cmd.exe", "explorer.exe",
    "ssh", "systemd", "nginx", "python.exe", "node.exe",
    "svchost.exe", "lsass.exe", "reg.exe", "sc.exe"
]

# Common parent processes for process creation events to add realism
PARENT_PROCESSES = [
    "explorer.exe", "services.exe", "systemd", "cmd.exe", "powershell.exe"
]

# Common service names for service installation/change events
SERVICE_NAMES = [
    "W32Time", "Spooler", "WinDefend", "sshd", "nginx", "postgresql", "docker"
]

# Common registry keys for Windows events
REGISTRY_KEYS = [
    r"HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run",
    r"HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services",
    r"HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run",
]

# Common actions for events
ACTIONS = ["allowed", "blocked", "modified", "created", "deleted", "executed"]

# Privilege levels for events that involve user permissions
PRIVILEGE_LEVELS = ["user", "power_user", "administrator", "system"]

# MITRE techniques and tactics for mapping suspicious events to known attack patterns
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

# Detection rules that might trigger based on the event characteristics and anomaly scores
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

# Possible report statuses for generated reports
REPORT_STATUSES = ["generated", "pending", "failed"]

# Sample first and last names for user generation
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

# This function is used to escape single quotes in SQL string literals to prevent syntax errors when inserting data into the database.
def sql_escape(value: str) -> str:
    return value.replace("'", "''")

# This function formats a datetime object into a string that can be used in SQL queries, following the standard 'YYYY-MM-DD HH:MM:SS' format.
def ts(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# This function generates a random datetime object in the past, within a specified number of days.
def random_past_datetime(days_back: int = 30) -> datetime:
    now = datetime.now()
    delta = timedelta(
        days=randint(0, days_back),
        hours=randint(0, 23),
        minutes=randint(0, 59),
        seconds=randint(0, 59),
    )
    return now - delta

# These functions are responsible for generating realistic values for various fields in the audit logs and alerts, 
# such as usernames, email addresses, device IDs, hostnames, OS versions, IP addresses, file paths, and hashes. 
# They use randomization to create diverse and plausible data points that can be used for testing and development purposes.
def make_username(first_name: str, last_name: str, index: int) -> str:
    return f"{first_name.lower()}.{last_name.lower()}{index}"

# This function generates an email address based on the provided username, using a fixed domain for consistency in the generated data.
def make_email(username: str) -> str:
    return f"{username}@monitoring.local"

# This function creates a device ID in the format "dev-XXX", where XXX is a random three-digit number, 
# simulating a unique identifier for devices in the audit logs.
def make_device_id() -> str:
    return f"dev-{randint(1, 40):03d}"

# This function generates a hostname based on the operating system type, using a prefix that corresponds 
# to the OS and a random four-digit number to create a realistic hostname for devices in the audit logs.
def make_hostname(os_type: str) -> str:
    prefix = {"Windows": "WIN", "Linux": "LNX", "macOS": "MAC"}[os_type]
    return f"{prefix}-{randint(1000, 9999)}"

# This function selects a random OS version from predefined lists based on the operating system type, 
# ensuring that the generated audit logs contain realistic OS version information for the devices involved in the events.
def make_os_version(os_type: str) -> str:
    if os_type == "Windows":
        return choice(WINDOWS_VERSIONS)
    if os_type == "Linux":
        return choice(LINUX_VERSIONS)
    return choice(MAC_VERSIONS)

# This function generates a random IP address, with the option to create either private or public IPs.
def make_ip(private=True) -> str:
    if private:
        return f"10.{randint(0,255)}.{randint(0,255)}.{randint(1,254)}"
    return f"{randint(11,223)}.{randint(0,255)}.{randint(0,255)}.{randint(1,254)}"

# This function generates a file path based on the operating system type, 
# providing realistic paths that might be accessed or modified in the events recorded in the audit logs.
def make_file_path(os_type: str) -> str:
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

# This function generates a random hash string, simulating file hashes that might be recorded in the audit logs for file access events.
def make_hash() -> str:
    chars = "abcdef0123456789"
    return "".join(choice(chars) for _ in range(64))

# These functions are used to infer the alert level and severity of events based on their anomaly scores and types, 
# allowing for a more nuanced and realistic generation of audit logs and alerts that reflect common patterns in cybersecurity monitoring
def infer_alert_level(score: float) -> str:
    if score >= 0.9:
        return "critical"
    if score >= 0.75:
        return "high"
    if score >= 0.5:
        return "warning"
    return "info"

# This function determines the severity of an event based on its type and anomaly score, 
# assigning higher severity levels to events that are more likely to indicate malicious activity or significant security incidents.
def infer_severity(event_type: str, anomaly_score: float) -> str:
    if event_type in {"privilege_escalation", "service_install"} and anomaly_score > 0.7:
        return "critical"
    if event_type in {"login_failed", "config_change", "network_connection"} and anomaly_score > 0.6:
        return "high"
    if anomaly_score > 0.4:
        return "medium"
    return "low"

# This function generates a list of user dictionaries, each containing an ID, username, email, role, and creation timestamp. 
# The usernames and emails are generated based on random combinations of first and last names, and the roles are randomly assigned from a predefined list. 
# This function is essential for creating realistic user data that can be associated with the audit logs and alerts in the generated seed data.
def generate_users(count: int = 25):
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

# This function builds a detailed event payload for a given user, 
# simulating various types of events that might be recorded in the audit logs. 
# It randomly determines the event type, associated attributes, 
# and whether the event is suspicious based on the anomaly score and event characteristics.
def build_event_payload(user):
    # Randomly select an OS type and event type for the event payload, and determine the corresponding event category.
    os_type = choice(OS_TYPES)
    event_type = choice(EVENT_TYPES)
    event_category = EVENT_CATEGORIES[event_type]
    anomaly_score = round(random(), 2)
    mitre_technique, detection_rule, mitre_tactic = None, None, None

    # Determine if the event is suspicious based on the anomaly score and event type, 
    # and assign MITRE technique and detection rule if it is.
    suspicious = anomaly_score > 0.72 or event_type in {"login_failed", "privilege_escalation", "service_install"}
    if suspicious:
        technique_id, technique_name, tactic = choice(MITRE_PAIRS)
        mitre_technique = f"{technique_id} - {technique_name}"
        mitre_tactic = tactic
        detection_rule = choice(DETECTION_RULES)
    else:
        detection_rule = "Known Benign Activity"

    # Generate source and destination IPs, with the destination IP being public if the event is suspicious, and private otherwise.
    source_ip = make_ip(private=True)
    destination_ip = make_ip(private=False if suspicious else True)

    # Determine login attempt count and status based on the event type, 
    # with failed login events having a random number of attempts and a "failed" status, while successful logins have a "success" status.
    login_attempt_count = randint(1, 8) if event_type == "login_failed" else 1
    login_status = "failed" if event_type == "login_failed" else ("success" if event_type == "login_success" else None)

    # Randomly select a process name, parent process, and privilege level for events that involve processes, services, or privileges,
    # with adjustments to the privilege level and anomaly score for certain event types to reflect their potential severity and risk.
    process_name = choice(PROCESS_NAMES)
    parent_process = choice(PARENT_PROCESSES)
    privilege_level = choice(PRIVILEGE_LEVELS)

    if event_type == "privilege_escalation":
        privilege_level = choice(["administrator", "system"])
        anomaly_score = round(max(anomaly_score, 0.80), 2)

    if event_type == "service_install":
        anomaly_score = round(max(anomaly_score, 0.70), 2)

    if event_type == "login_failed" and login_attempt_count >= 5:
        anomaly_score = round(max(anomaly_score, 0.78), 2)

    alert_level = infer_alert_level(anomaly_score)
    event_severity = infer_severity(event_type, anomaly_score)

    # Build the event payload with all the generated and inferred attributes, 
    # creating a comprehensive representation of the event that can be stored in the audit logs 
    # and used for generating alerts and reports.
    payload = {
        "device_id": make_device_id(),
        "user_id": user["id"],
        "hostname": make_hostname(os_type),
        "os_type": os_type,
        "os_version": make_os_version(os_type),
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

# This function takes an event payload and generates a human-readable summary of the event based on its type and key attributes.
def summarize_event(payload):
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

# This function generates a list of audit log entries based on the provided users, 
# creating realistic event messages that include rich JSON payloads with summaries and details of each event.
def generate_audit_logs(users, count: int = 700):
    logs = []
    for i in range(1, count + 1):
        user = choice(users)
        payload = build_event_payload(user)
        event_time = datetime.strptime(payload["timestamp"], "%Y-%m-%d %H:%M:%S")
        summary = summarize_event(payload)

        # Store rich JSON inside event_message
        event_message = json.dumps({
            "summary": summary,
            "details": payload
        }, ensure_ascii=False)

        logs.append({
            "id": i,
            "user_id": user["id"],
            "machine_id": payload["device_id"],
            "event_type": payload["event_type"],
            "event_message": event_message,
            "event_time": event_time,
            "severity": payload["event_severity"],
            "payload": payload,
        })
    return logs

# This function generates a list of alert entries based on the provided audit logs, 
# selecting suspicious logs and creating alert descriptions that summarize the key attributes of the events that triggered the alerts, 
# such as the alert level, event type, hostname, username, anomaly score, model source, and detection rule.
def generate_alerts(audit_logs, count: int = 140):
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
            "anomaly_score": p["anomaly_score"],
            "alert_type": p["alert_level"],
            "description": description,
            "created_at": created_at,
        })
    return alerts

# This function generates a list of report entries with predefined names and random statuses, 
# simulating the generation of various types of reports that might be used for dashboard validation and backend stress testing, 
# with summaries that reflect the status of each report.
def generate_reports(count: int = 20):
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
    for i in range(1, count + 1):
        name = names[i - 1]
        status = choice(REPORT_STATUSES)
        reports.append({
            "id": i,
            "report_name": name,
            "generated_at": random_past_datetime(20),
            "status": status,
            "summary": (
                f"{name} generated for dashboard validation and backend stress testing."
                if status == "generated"
                else f"{name} is {status} and may contain partial results."
            ),
        })
    return reports

# This function builds the SQL content for inserting the generated users, audit logs, alerts, and reports into the database,
# including the necessary SQL statements to truncate existing data and insert new rows with properly escaped values and formatted timestamps.
def build_sql(users, audit_logs, alerts, reports):
    lines = []
    lines.append("-- Auto-generated by generate_seed.py")
    lines.append("-- Rich cyber-security seed data stored in current schema")
    lines.append("")
    lines.append("TRUNCATE TABLE alerts, audit_logs, reports, users RESTART IDENTITY;")
    lines.append("")

    lines.append("INSERT INTO users (username, email, role, created_at) VALUES")
    user_rows = []
    for u in users:
        user_rows.append(
            f"('{sql_escape(u['username'])}', '{sql_escape(u['email'])}', '{sql_escape(u['role'])}', '{ts(u['created_at'])}')"
        )
    lines.append(",\n".join(user_rows) + ";")
    lines.append("")

    lines.append("INSERT INTO audit_logs (user_id, machine_id, event_type, event_message, event_time, severity) VALUES")
    audit_rows = []
    for a in audit_logs:
        audit_rows.append(
            f"({a['user_id']}, '{sql_escape(a['machine_id'])}', '{sql_escape(a['event_type'])}', "
            f"'{sql_escape(a['event_message'])}', '{ts(a['event_time'])}', '{sql_escape(a['severity'])}')"
        )
    lines.append(",\n".join(audit_rows) + ";")
    lines.append("")

    lines.append("INSERT INTO alerts (audit_id, anomaly_score, alert_type, description, created_at) VALUES")
    alert_rows = []
    for a in alerts:
        alert_rows.append(
            f"({a['audit_id']}, {a['anomaly_score']}, '{sql_escape(a['alert_type'])}', "
            f"'{sql_escape(a['description'])}', '{ts(a['created_at'])}')"
        )
    lines.append(",\n".join(alert_rows) + ";")
    lines.append("")

    lines.append("INSERT INTO reports (report_name, generated_at, status, summary) VALUES")
    report_rows = []
    for r in reports:
        report_rows.append(
            f"('{sql_escape(r['report_name'])}', '{ts(r['generated_at'])}', "
            f"'{sql_escape(r['status'])}', '{sql_escape(r['summary'])}')"
        )
    lines.append(",\n".join(report_rows) + ";")
    lines.append("")

    return "\n".join(lines)

# The main function orchestrates the generation of users, audit logs, alerts, and reports, and then builds the SQL content to be written to the output file. 
# It also prints a summary of the generated data, including the number of users, audit logs, alerts, and reports, to provide feedback on the seeding process.
def main():
    # Generate users, audit logs, alerts, and reports with realistic and rich data for testing and development purposes.
    users = generate_users(25) # Default is 25, but can be adjusted to generate more or fewer users as needed for testing.
    audit_logs = generate_audit_logs(users, 700) # Default is 700, but can be adjusted to generate more or fewer audit logs to simulate different volumes of data for testing.
    alerts = generate_alerts(audit_logs, 140) # Default is 140, but can be adjusted to generate more or fewer alerts as needed for testing.
    reports = generate_reports(20) # Default is 20, but can be adjusted to generate more or fewer reports as needed for testing.

    sql_content = build_sql(users, audit_logs, alerts, reports)
    OUTPUT_FILE.write_text(sql_content, encoding="utf-8")

    print(f"Generated: {OUTPUT_FILE}")
    print(f"Users: {len(users)}")
    print(f"Audit logs: {len(audit_logs)}")
    print(f"Alerts: {len(alerts)}")
    print(f"Reports: {len(reports)}")

if __name__ == "__main__":
    main()