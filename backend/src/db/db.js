// Import PostgreSQL client library and dotenv for environment variables
import pg from "pg";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load environment variables from .env file
dotenv.config();

// Extract Pool class from pg module
const { Pool, Client } = pg;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "monitoring_db"
};

// Create a connection pool for PostgreSQL database
const pool = new Pool(dbConfig);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../../../database/schema.sql");

// Helper to log a more helpful error when the database is missing
const logDbError = (err, dbName) => {
  if (err.message.includes("database \"" + dbName + "\" does not exist")) {
    console.error(
      `PostgreSQL connection failed: database '${dbName}' does not exist. ` +
        `Create it with 'createdb ${dbName}' or update your DB_NAME in .env.`
    );
  } else {
    console.error("PostgreSQL connection failed:", err.message);
  }
};

const isMissingDatabaseError = (err, dbName) =>
  err.message.includes(`database "${dbName}" does not exist`);

const quoteIdentifier = (value) => `"${String(value).replace(/"/g, "\"\"")}"`;

const createDatabaseIfMissing = async (dbName) => {
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres"
  });

  await adminClient.connect();

  try {
    const { rowCount } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
      console.log(`Created PostgreSQL database '${dbName}'`);
    }
  } finally {
    await adminClient.end();
  }
};

const ensureSchema = async () => {
  const schemaSql = await readFile(schemaPath, "utf8");
  await pool.query(schemaSql);
};

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    if (!isMissingDatabaseError(err, process.env.DB_NAME)) {
      throw err;
    }

    await createDatabaseIfMissing(process.env.DB_NAME);
  }

  await ensureSchema();
  console.log(`Connected to PostgreSQL database '${process.env.DB_NAME}'`);
};

const initializationPromise = initializeDatabase().catch((err) => {
  logDbError(err, process.env.DB_NAME);
  throw err;
});

// Handle unexpected errors on the pool
pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

const db = {
  query: async (...args) => {
    await initializationPromise;
    return pool.query(...args);
  },
  connect: async () => {
    await initializationPromise;
    return pool.connect();
  },
  end: (...args) => pool.end(...args),
  ready: initializationPromise
};

export default db;
