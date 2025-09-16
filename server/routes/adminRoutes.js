// routes/adminRoutes.js

import express from "express";
import { getAllReports, updateReportStatus } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all reports - protected and for admins only
router.get("/reports", protect, admin, getAllReports);
router.put("/reports/:id/status", protect, admin, updateReportStatus);

export default router;