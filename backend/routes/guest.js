import express from 'express';
import { createGuestRequest, updateGuestStatus, getGuestRequestStatus, payGuestFee } from '../controllers/guestController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/request', createGuestRequest);
router.get('/status', getGuestRequestStatus);
router.post('/pay-fee', payGuestFee);
router.put('/:id', protect, admin, updateGuestStatus);

export default router;
