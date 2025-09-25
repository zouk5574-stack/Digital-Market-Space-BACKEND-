const express = require("express");
const app = express();

// Middleware pour lire du JSON
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Backend Render est en ligne !");
});

// Render donne un port automatiquement → on le récupère
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
