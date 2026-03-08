// Import database connection pool
import db from "../db/db.js";

// Service function to fetch all devices
export const fetchDevices = async () => {
  // Query to select distinct devices from audit_logs
  const query = `
    SELECT DISTINCT machine_id as device_name, user_id, 'unknown' as os_type, MIN(event_time) as created_at
    FROM audit_logs
    GROUP BY machine_id, user_id
    ORDER BY created_at DESC
  `;

  // Execute query and return device list
  const result = await db.query(query);
  // Add id as index for compatibility
  return result.rows.map((row, index) => ({ id: index + 1, ...row }));
};

// Service function to fetch a single device by ID
export const fetchDeviceById = async (id) => {
  // Since id is not in audit_logs, fetch all and find by index
  const devices = await fetchDevices();
  return devices.find(device => device.id == id) || null;
};