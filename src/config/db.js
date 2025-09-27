/**
 * src/config/db.js
 *
 * Connexion PostgreSQL simple et robuste avec node-postgres (pg).
 * - Exporte par défaut `pool` (utilisé dans les controllers/routes comme `import pool from "../config/db.js"`)
 * - Fournit `query(sql, params)` et `getClient()` pour les transactions
 *
 * Variables d'environnement attendues:
 * - DATABASE_URL (preferred) OR PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
 * - NODE_ENV (production pour forcer SSL)
 *
 * Assure-toi d'installer: npm i pg
 */

import pkg from "pg";
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

// Build config: prefer DATABASE_URL if present (Render/Heroku style), otherwise individual vars
let poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  // For many hosting providers you need SSL true but without rejecting unauthorized (adjust if you have CA)
  if (isProduction) {
    poolConfig.ssl = {
      rejectUnauthorized: false,
    };
  }
} else {
  poolConfig = {
    host: process.env.PGHOST || "localhost",
    user: process.env.PGUSER || process.env.DB_USER || "postgres",
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.PGDATABASE || process.env.DB_NAME || "postgres",
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  if (isProduction) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

// Optional: simple health-check / friendly error output on connect failure
pool.on("error", (err) => {
  // This will fire for idle clients in background; log it for visibility.
  console.error("Unexpected error on idle pg client", err);
});

// Utility query wrapper (auto release)
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // uncomment the next line if you want query logging in development
    // if (!isProduction) console.log("PG QUERY", { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    // attach query text for easier debugging
    err.query = text;
    throw err;
  }
}

// Utility: get a client for transactions
async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // monkey-patch to measure queries if needed
  client.query = (...args) => query.apply(client, args);
  client.release = (...args) => release.apply(client, args);

  return client;
}

export default pool;
export { query, getClient };
