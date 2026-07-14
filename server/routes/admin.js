import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { allowAdmin } from '../middleware/roleGuard.js';
import { getAllUsers, getAllWorkers, getAllBookings } from '../controllers/adminController.js';

const router = express.Router();

// Example admin endpoints (replace with real implementations)
router.get('/users', protect, allowAdmin, getAllUsers);
router.get('/workers', protect, allowAdmin, getAllWorkers);
router.get('/bookings', protect, allowAdmin, getAllBookings);

export default router;
