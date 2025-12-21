import Student from '../models/Student.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new student
// @route   POST /api/student/register
// @access  Public
export const registerStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password, parentsName, phone, hostelId, floor, roomNumber, studentId } = req.body;

        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const student = await Student.create({
            firstName,
            lastName,
            email,
            password,
            parentsName,
            phone,
            hostelId,
            floor,
            roomNumber,
            studentId: studentId || `STU${Date.now()}`,
            otp: {
                code: otpCode,
                expiresAt: otpExpires
            }
        });

        if (student) {
            await sendEmail({
                email: student.email,
                subject: 'HostelWise Email Verification',
                message: `Your verification OTP is ${otpCode}`
            });

            res.status(201).json({
                _id: student._id,
                email: student.email,
                message: 'Registration successful. Please verify OTP.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login student & get token
// @route   POST /api/student/login
// @access  Public
export const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        // Note: Password check relies on bcrypt compare method on model or manual compare here. 
        // Since I added pre-save, I need a method to match password. OR use bcrypt directly here.
        // I will use bcrypt directly for simplicity.
        const bcrypt = (await import('bcryptjs')).default;

        if (student && (await bcrypt.compare(password, student.password))) {
            if (!student.isVerified) {
                return res.status(401).json({ message: 'Email not verified' });
            }

            res.json({
                _id: student._id,
                firstName: student.firstName,
                email: student.email,
                role: 'STUDENT',
                token: generateToken(student._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/student/verify-otp
// @access  Public
export const verifyStudentOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const student = await Student.findOne({ email });

        if (student && student.otp && student.otp.code === otp && student.otp.expiresAt > Date.now()) {
            student.isVerified = true;
            student.otp = undefined;
            await student.save();

            res.json({
                _id: student._id,
                firstName: student.firstName,
                email: student.email,
                role: 'STUDENT',
                token: generateToken(student._id),
                message: 'Email Verified'
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Profile
// @route   GET /api/student/profile
// @access  Private
export const getStudentProfile = async (req, res) => {
    try {
        let student = await Student.findById(req.user._id);
        if (student) {
            // Ensure bills and discounted rates are synchronized for all students during this update phase
            let updated = false;
            // Force update to 21.6k if currently 0, null, or 30k (the old default)
            if (student.pendingFee === 0 || !student.pendingFee || student.pendingFee === 30000) {
                student.pendingFee = 21600;
                updated = true;
            }
            if (!student.messBill) {
                student.messBill = 5000;
                updated = true;
            }
            if (!student.gymBill) {
                student.gymBill = 2000;
                updated = true;
            }

            // Sync feeStatus: if any dues exist and not already pending, mark as unpaid
            const totalDues = (student.pendingFee || 0) + (student.messBill || 0) + (student.gymBill || 0);
            if (totalDues > 0 && student.feeStatus === 'paid') {
                student.feeStatus = 'unpaid';
                updated = true;
            }

            if (updated) await student.save();

            // Add default random image if profilePhoto is missing
            const studentData = student.toObject();
            if (!studentData.profilePhoto) {
                studentData.profilePhoto = `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random&color=fff&size=200`;
            }
            res.json(studentData);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pay Student Fee
// @route   POST /api/student/pay-fee
// @access  Private
export const payFee = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);

        if (student) {
            if (student.feeStatus === 'pending') {
                return res.status(400).json({ message: 'Payment already pending approval' });
            }
            if (student.feeStatus === 'paid') {
                return res.status(400).json({ message: 'Fee already paid' });
            }

            student.feeStatus = 'pending';
            student.paymentMethod = 'CASH';
            student.lastPaymentDetails = {
                amount: req.body.amount || student.pendingFee,
                date: new Date()
            };

            await student.save();
            res.json({ message: 'Payment recorded and pending warden approval', student });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
