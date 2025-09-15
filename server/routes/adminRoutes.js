import express from "express";
import { getAllReports, updateReportStatus } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/reports", protect, adminOnly, getAllReports);
router.patch("/reports/:id/status", protect, adminOnly, updateReportStatus);

export default router;
