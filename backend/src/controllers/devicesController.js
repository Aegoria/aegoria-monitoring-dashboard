// Import device service functions
import {
  fetchDevices,
  fetchDeviceById
} from "../services/deviceService.js";

// Controller function to get all devices
export const getDevices = async (req, res, next) => {
  try {
    // Fetch all devices from service layer
    const devices = await fetchDevices();
    res.json(devices);
  } catch (err) {
    next(err);
  }
};

// Controller function to get a specific device by ID
export const getDeviceById = async (req, res, next) => {
  try {
    // Extract device ID from URL parameters
    const { id } = req.params;
    const device = await fetchDeviceById(id);

    // Return 404 if device not found
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    next(err);
  }
};