import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Login admin
router.post("/login", (req, res) => {
  const { phone, password } = req.body;

  // 👉 Vérifie avec tes infos fixes (qu’on a déjà définies)
  if (phone === "+2290140410161" && password === "Affom@rzouck13/03/2006") {
    const token = jwt.sign(
      { phone, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, error: "Invalid credentials" });
});

export default router;
