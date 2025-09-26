import express from "express";
import serverless from "serverless-http";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// === Tes routes habituelles ===
app.get("/", (req, res) => {
  res.send("Bienvenue sur Digital Market Space 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API opérationnelle sur Vercel !" });
});

// === Export pour Vercel ===
export const handler = serverless(app);
