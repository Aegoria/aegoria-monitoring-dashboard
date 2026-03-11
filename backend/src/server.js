// Import required modules
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import route handlers
import devicesRoutes from "./routes/devices.js";
import logsRoutes from "./routes/logs.js";
import alertsRoutes from "./routes/alerts.js";
import dashboardRoutes from "./routes/dashboard.js";
import scanRoutes from "./routes/scan.js";

// Import error handling middleware
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
// Enable CORS for cross-origin requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Root route - health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Cybersecurity dashboard backend API is running"
  });
});

// Dedicated health endpoint required by the OpenAPI contract.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Temporary authentication endpoint for demonstration purposes
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    res.json({
      token: "fake-jwt-token-123",
      user: {
        username: "admin",
        name: "Admin User",
        role: "Security Lead"
      }
    });
  } else {
    res.status(401).json({
      message: "Invalid username or password"
    });
  }
});

// Mount route handlers
app.use("/devices", devicesRoutes);
app.use("/logs", logsRoutes);
app.use("/alerts", alertsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/", scanRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
