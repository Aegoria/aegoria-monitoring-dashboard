import db from "../db/db.js";

// Devices now live in their own table, so the service reads directly from
// `devices` and only uses audit logs to enrich each row with a recent activity
// timestamp. A few compatibility aliases are returned because the current UI
// still looks for older field names such as `hostname` and `ip`.
export const fetchDevices = async () => {
  const query = `
    SELECT
      d.id,
      d.name,
      d.name AS hostname,
      d.ip_address,
      d.ip_address AS ip,
      d.status,
      d.created_at,
      COALESCE(MAX(al.event_time), d.created_at) AS last_active,
      'Unknown OS' AS os_type
    FROM devices d
    LEFT JOIN audit_logs al ON al.device_id = d.id
    GROUP BY d.id, d.name, d.ip_address, d.status, d.created_at
    ORDER BY d.created_at DESC
  `;

  const result = await db.query(query);
  return result.rows;
};

// Fetch a single device directly from the devices table so the route remains
// consistent with the OpenAPI contract and database primary key.
export const fetchDeviceById = async (id) => {
  const query = `
    SELECT
      d.id,
      d.name,
      d.name AS hostname,
      d.ip_address,
      d.ip_address AS ip,
      d.status,
      d.created_at,
      COALESCE(MAX(al.event_time), d.created_at) AS last_active,
      'Unknown OS' AS os_type
    FROM devices d
    LEFT JOIN audit_logs al ON al.device_id = d.id
    WHERE d.id = $1
    GROUP BY d.id, d.name, d.ip_address, d.status, d.created_at
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};
