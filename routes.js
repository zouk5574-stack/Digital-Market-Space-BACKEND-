// routes.js
const express = require('express');
const router = express.Router();
const supabase = require('./db');

// Exemple : route pour lister les utilisateurs
router.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data);
});

module.exports = router;
