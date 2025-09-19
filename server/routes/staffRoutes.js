import express from 'express';
import { resolveReport } from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js'; // You'll need a staffMiddleware too

const router = express.Router();
// This route needs middleware to ensure only staff can access it
router.put('/reports/:id/resolve', protect, /* staffMiddleware, */ resolveReport);

export default router;