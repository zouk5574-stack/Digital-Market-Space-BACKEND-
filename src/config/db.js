// src/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // nécessaire pour Supabase
  },
});

// Helper pour exécuter des requêtes SQL
export const query = (text, params) => pool.query(text, params);

export default pool;
