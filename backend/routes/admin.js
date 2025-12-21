import express from 'express';
import { loginAdmin, getAdminDashboard, getPendingPayments, approvePayment } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/dashboard', protect, admin, getAdminDashboard);
router.get('/pending-payments', protect, admin, getPendingPayments);
router.put('/approve-payment/:id', protect, admin, approvePayment);

export default router;
