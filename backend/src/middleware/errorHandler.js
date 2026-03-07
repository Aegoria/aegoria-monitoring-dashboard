// Middleware function to handle 404 Not Found errors
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
};

// General error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log error details to console for debugging
  console.error("ERROR DETAILS:", err);

  // Send error response with appropriate status code
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
};