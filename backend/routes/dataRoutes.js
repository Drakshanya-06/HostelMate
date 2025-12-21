import express from 'express';
import { getDashboardData } from '../controllers/dataController.js';
import { createGuestRequest, updateGuestStatus } from '../controllers/guestController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.post('/guest-request', createGuestRequest);
router.put('/guest-request/:id', protect, admin, updateGuestStatus);

export default router;
