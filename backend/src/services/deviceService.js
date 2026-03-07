import db from "../db/db.js";

export const fetchDevices = async () => {
  const query = `
    SELECT id, user_id, device_name, os_type, created_at
    FROM devices
    ORDER BY created_at DESC
  `;

  const result = await db.query(query);
  return result.rows;
};

export const fetchDeviceById = async (id) => {
  const query = `
    SELECT id, user_id, device_name, os_type, created_at
    FROM devices
    WHERE id = $1
  `;

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};