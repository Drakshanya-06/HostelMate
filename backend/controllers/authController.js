import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import sendEmail from '../utils/sendEmail.js';
import bcrypt from 'bcryptjs';

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check Student first, then Admin
        let user = await Student.findOne({ email });
        let role = 'student';
        if (!user) {
            user = await Admin.findOne({ email });
            role = 'admin';
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Save OTP
        // Ensure only one OTP per email
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp });

        // In development, log OTP to console instead of sending email
        if (process.env.NODE_ENV !== 'production') {
            console.info(`🔐 OTP for ${email}: ${otp} (dev mode)`);
        }

        // Send Email
        let emailResult = { success: false };
        try {
            emailResult = await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`
            });
        } catch (error) {
            console.error('OTP email failed:', error.message || error);
        }

        if (!emailResult.success) {
            const fallbackMessage = process.env.NODE_ENV !== 'production'
                ? `OTP generated: ${otp}. Check console for details.`
                : 'OTP generated but email delivery failed. Please contact support.';
            return res.json({ message: `OTP generated. ${fallbackMessage}` });
        }

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        res.json({ message: 'OTP verified' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Find user
        let user = await Student.findOne({ email });
        let isStudent = true;
        if (!user) {
            user = await Admin.findOne({ email });
            isStudent = false;
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password strength (minimum 6 characters)
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        // Set new password (will be hashed by pre('save') hook in model)
        user.password = newPassword;
        await user.save();
        // Delete used OTP
        try {
            await OTP.deleteOne({ _id: otpRecord._id });
        } catch (e) {
            console.error('Failed to delete OTP:', e);
        }

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
