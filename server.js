import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Test route racine "/"
app.get("/", (req, res) => {
  res.send("🚀 Hello frérot ! Ton serveur Render fonctionne ✅");
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
