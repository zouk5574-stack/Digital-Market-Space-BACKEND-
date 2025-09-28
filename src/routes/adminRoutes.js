import express from "express";
import { getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

// Route unique pour stats admin
router.get("/stats", getAdminStats);

export default router;
