// db.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Connexion à Supabase avec les variables d'environnement
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
