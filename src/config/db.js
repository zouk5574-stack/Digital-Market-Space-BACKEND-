import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set in env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PG_MAX_CLIENTS || 10),
  ssl: { rejectUnauthorized: false }
});

export const query = (text, params) => pool.query(text, params);
export default pool;
