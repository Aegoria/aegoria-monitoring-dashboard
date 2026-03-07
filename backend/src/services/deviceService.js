// Import database connection pool
import db from "../db/db.js";

// Service function to fetch all devices
export const fetchDevices = async () => {
  // Query to select all devices ordered by creation date (newest first)
  const query = `
    SELECT id, user_id, device_name, os_type, created_at
    FROM devices
    ORDER BY created_at DESC
  `;

  // Execute query and return device list
  const result = await db.query(query);
  return result.rows;
};

// Service function to fetch a single device by ID
export const fetchDeviceById = async (id) => {
  // Query to select device by ID
  const query = `
    SELECT id, user_id, device_name, os_type, created_at
    FROM devices
    WHERE id = $1
  `;

  // Execute query and return device or null
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};