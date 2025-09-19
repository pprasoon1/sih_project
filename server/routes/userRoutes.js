import express from 'express';
import { getUserProfile, getLeaderboard } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/leaderboard', getLeaderboard); // Public route

export default router;