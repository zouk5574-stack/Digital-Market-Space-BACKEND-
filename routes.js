// routes.js
const express = require('express');
const router = express.Router();
const supabase = require('./db');

// ✅ Route test pour vérifier la connexion API
router.get('/ping', (req, res) => {
  res.json({ message: "✅ API opérationnelle" });
});

// ✅ Exemple de route : récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});

module.exports = router;
