import express from 'express';
import { 
    handleChatMessage, 
    handleLocationUpdate, 
    handlePhotoUpdate, 
    handlePhotoWithDescription,
    clearSession 
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Main chat endpoint
router.post('/message', protect, handleChatMessage);

// Location update endpoint
router.post('/location', protect, handleLocationUpdate);

// Photo with description endpoint (new workflow)
router.post('/photo-description', protect, handlePhotoWithDescription);

// Photo update endpoint  
router.post('/photo', protect, handlePhotoUpdate);

// Clear session endpoint
router.delete('/session/:sessionId', protect, clearSession);

export default router;