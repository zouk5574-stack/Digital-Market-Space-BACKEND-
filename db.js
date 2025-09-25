// db.js - pool Postgres
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERREUR: variable DATABASE_URL non définie !");
  process.exit(1);
}

// Si Supabase (Postgres) nécessite SSL, on configure rejectUnauthorized false
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
