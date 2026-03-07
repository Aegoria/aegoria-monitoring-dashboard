import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import devicesRoutes from "./routes/devices.js";
import logsRoutes from "./routes/logs.js";
import alertsRoutes from "./routes/alerts.js";
import dashboardRoutes from "./routes/dashboard.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Cybersecurity dashboard backend API is running"
  });
});

app.use("/devices", devicesRoutes);
app.use("/logs", logsRoutes);
app.use("/alerts", alertsRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});