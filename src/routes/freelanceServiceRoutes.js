import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createService,
  getMyServices,
  updateServiceStatus,
} from "../controllers/freelanceServiceController.js";

const router = express.Router();

router.post("/", protect, createService);
router.get("/me", protect, getMyServices);
router.put("/:id/status", protect, updateServiceStatus);

export default router;
