// Import PostgreSQL client library and dotenv for environment variables
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Extract Pool class from pg module
const { Pool } = pg;

// Create a connection pool for PostgreSQL database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test database connection on startup
(async () => {
  try {
    // Attempt to connect to the database
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    // Release the client back to the pool
    client.release();
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
  }
})();

// Handle unexpected errors on the pool
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

// Export the pool for use in other modules
export default pool;