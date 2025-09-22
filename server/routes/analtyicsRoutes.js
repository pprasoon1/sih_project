import express from 'express';
import { getDashboardStats, getChartData, getExtendedAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);
router.get('/charts', protect, admin, getChartData);
router.get('/extended', protect, admin, getExtendedAnalytics);

export default router;