// src/config/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Vérification
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL manquant dans .env");
  process.exit(1);
}

// Connexion au pool PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // ⚠️ nécessaire pour Supabase
  },
});

// Helper pour requêtes rapides
export const query = (text, params) => pool.query(text, params);

export default pool;
