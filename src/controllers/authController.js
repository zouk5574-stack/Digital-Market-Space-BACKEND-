const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Connexion admin uniquement via téléphone
exports.loginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Chercher admin unique
    const admin = await db.oneOrNone(
      "SELECT * FROM users WHERE phone = $1 AND role = 'admin'",
      [phone]
    );

    if (!admin) {
      return res.status(401).json({ message: "Accès refusé : admin introuvable" });
    }

    // Vérifier mot de passe hashé
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer token JWT
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      message: "Connexion admin réussie ✅",
      token,
      admin: {
        id: admin.id,
        nom: admin.nom,
        prenom: admin.prenom,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Erreur loginAdmin:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
