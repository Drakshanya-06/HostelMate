import express from 'express';
import {
    forgotPassword,
    resetPassword,
    verifyResetOtp
} from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;
