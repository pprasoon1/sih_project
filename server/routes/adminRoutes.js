// routes/adminRoutes.js

import express from "express";
import { assignReportToDept, createDepartment, getAllReports, getDepartments, updateReportStatus } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all reports - protected and for admins only
router.get("/reports", protect, admin, getAllReports);
router.put("/reports/:id/status", protect, admin, updateReportStatus);

// Department Management
router.post("/departments", protect, admin, createDepartment);
router.get("/departments", protect, admin, getDepartments);

// Report Assignment
router.put("/reports/:id/assign", protect, admin, assignReportToDept);

export default router;