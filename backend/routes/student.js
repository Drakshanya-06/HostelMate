import express from 'express';
import { registerStudent, loginStudent, verifyStudentOtp, getStudentProfile, payFee } from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/verify-otp', verifyStudentOtp);
router.get('/profile', protect, getStudentProfile);
router.post('/pay-fee', protect, payFee);

export default router;
