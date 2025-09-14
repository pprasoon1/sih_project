import express from "express";
import { createReport, getMyReports, getReportsNearby } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/my", protect, getMyReports);
router.get("/nearby", protect, getReportsNearby);

export default router;
