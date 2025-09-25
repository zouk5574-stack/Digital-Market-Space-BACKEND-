import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};
