const jwt = require("jsonwebtoken");

// Vérification du token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
};

// Vérification admin uniquement
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé à l’administrateur" });
  }
  next();
};
