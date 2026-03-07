import {
  fetchDevices,
  fetchDeviceById
} from "../services/deviceService.js";

export const getDevices = async (req, res, next) => {
  try {
    const devices = await fetchDevices();
    res.json(devices);
  } catch (err) {
    next(err);
  }
};

export const getDeviceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await fetchDeviceById(id);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    next(err);
  }
};