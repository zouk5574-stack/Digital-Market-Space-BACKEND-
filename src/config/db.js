// src/db.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
import pool, { query } from "../config/db.js";
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ajouter ssl si nécessaire (ex: Supabase)
  ssl: {
    rejectUnauthorized: false
  }
});

// simple helper to query
export const query = (text, params) => pool.query(text, params);
export default pool;
