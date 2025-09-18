import express from "express";
import { 
  getAllReports,
  updateReportStatus,
  assignReportToDept,
  createDepartment,
  getDepartments,
  getReportById,
  escalateReport,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/reports", protect, admin, getAllReports);
router.get('/reports/:id', protect, admin, getReportById);
router.put("/reports/:id/status", protect, admin, updateReportStatus);
router.put("/reports/:id/assign", protect, admin, assignReportToDept);
router.post('/reports/:id/escalate', protect, admin, escalateReport);

router.post("/departments", protect, admin, createDepartment);
router.get("/departments", protect, admin, getDepartments);

export default router;