import db from "../db/db.js";

// Service function to fetch all devices.
// This SQL query retrieves a list of devices by grouping audit logs based on machine_id and operating system type, 
// while also selecting the earliest event time for each device to determine when it was first seen in the logs. 
// The query uses COALESCE to handle cases where the OS type might be missing, defaulting to 'unknown'.
export const fetchDevices = async () => {
  const query = `
    SELECT
      machine_id AS device_name,
      MIN(user_id) AS user_id,
      COALESCE(
        event_message::json->'details'->>'os_type',
        'unknown'
      ) AS os_type,
      MIN(event_time) AS created_at
    FROM audit_logs
    GROUP BY
      machine_id,
      COALESCE(event_message::json->'details'->>'os_type', 'unknown')
    ORDER BY created_at DESC
  `; 

  const result = await db.query(query);
  return result.rows.map((row, index) => ({ id: index + 1, ...row }));
};

export const fetchDeviceById = async (id) => {
  const devices = await fetchDevices();
  return devices.find((device) => device.id == id) || null;
};