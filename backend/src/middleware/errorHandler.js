export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR DETAILS:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
};