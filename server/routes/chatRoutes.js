import express from 'express';
import { 
    handleChatMessage, 
    handleLocationUpdate, 
    handlePhotoUpdate, 
    clearSession 
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Main chat endpoint
router.post('/message', protect, handleChatMessage);

// Location update endpoint
router.post('/location', protect, handleLocationUpdate);

// Photo update endpoint  
router.post('/photo', protect, handlePhotoUpdate);

// Clear session endpoint
router.delete('/session/:sessionId', protect, clearSession);

export default router;