/**
 * src/server.js
 * Point d'entrée principal du backend
 */

import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API lancé sur le port ${PORT}`);
});
