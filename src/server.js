/**
 * src/server.js
 * Point d'entrée : démarre le serveur en important app.js
 */

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Digital Market Space API lancé sur le port ${PORT}`);
});
