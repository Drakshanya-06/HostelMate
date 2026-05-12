import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Guest from '../models/Guest.js';
import Hostel from '../models/Hostel.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { generateReceiptPDF } from '../utils/generatePDF.js';

// @desc    Auth Admin/Warden
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        const bcrypt = (await import('bcryptjs')).default;

        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
    try {
        // Fetch all data for dashboard
        const students = await Student.find({});
        const guests = await Guest.find({});
        const rooms = await Hostel.find({});

        const studentList = students.map(s => ({
            id: s.studentId || s._id,
            studentId: s.studentId || s._id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            roomNumber: s.roomNumber,
            phone: s.phone,
            status: s.status,
            floor: s.floor,
            pendingFee: s.pendingFee,
            feeStatus: s.feeStatus || 'unpaid',
            profilePhoto: s.profilePhoto || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=random&color=fff&size=200`
        }));

        res.json({
            students: studentList,
            guestRequests: guests,
            rooms: rooms.map(r => ({
                id: r._id,
                roomNumber: r.roomNumber,
                capacity: r.capacity || 4,
                currentOccupancy: r.currentOccupancy || 0
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Pending Fee Approvals
// @route   GET /api/admin/pending-payments
// @access  Private/Admin
export const getPendingPayments = async (req, res) => {
    try {
        const students = await Student.find({ feeStatus: 'pending' });
        const guests = await Guest.find({ feeStatus: 'pending' });

        res.json({
            students: students.map(s => ({
                id: s._id,
                name: `${s.firstName} ${s.lastName}`,
                amount: s.lastPaymentDetails?.amount || s.pendingFee,
                date: s.lastPaymentDetails?.date || s.updatedAt,
                type: 'STUDENT',
                studentId: s.studentId
            })),
            guests: guests.map(g => ({
                id: g._id,
                name: g.name,
                amount: g.totalFee,
                date: g.updatedAt,
                type: 'GUEST',
                email: g.email
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve Fee Payment
// @route   PUT /api/admin/approve-payment/:id
// @access  Private/Admin
export const approvePayment = async (req, res) => {
    try {
        const { type } = req.body; // 'STUDENT' or 'GUEST'
        let entity;

        if (type === 'STUDENT') {
            entity = await Student.findById(req.params.id);
            if (entity) {
                const receiptId = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                let remainingPaid = entity.lastPaymentDetails?.amount || 0;
                const totalPaidAtStart = remainingPaid;

                // 1. Deduct from Hostel Fee
                const hostelDeduction = Math.min(entity.pendingFee, remainingPaid);
                entity.pendingFee -= hostelDeduction;
                remainingPaid -= hostelDeduction;

                // 2. Deduct from Mess Bill
                const messDeduction = Math.min(entity.messBill, remainingPaid);
                entity.messBill -= messDeduction;
                remainingPaid -= messDeduction;
                if (entity.messBill === 0) entity.hasMess = true;

                // 3. Deduct from Gym Bill
                const gymDeduction = Math.min(entity.gymBill, remainingPaid);
                entity.gymBill -= gymDeduction;
                remainingPaid -= gymDeduction;
                if (entity.gymBill === 0) entity.hasGym = true;

                // 4. Deduct from Laundry Bill
                const laundryDeduction = Math.min(entity.laundryBill || 0, remainingPaid);
                entity.laundryBill = (entity.laundryBill || 0) - laundryDeduction;
                remainingPaid -= laundryDeduction;
                if (entity.laundryBill === 0) entity.hasLaundry = true;

                // Set status to paid only if ALL are cleared
                entity.feeStatus = (entity.pendingFee === 0 && entity.messBill === 0 && entity.gymBill === 0 && (entity.laundryBill || 0) === 0) ? 'paid' : 'unpaid';

                entity.paymentHistory.push({
                    amount: totalPaidAtStart,
                    date: new Date(),
                    method: entity.paymentMethod || 'CASH',
                    receiptId: receiptId
                });
                await entity.save();

                const pdfBuffer = await generateReceiptPDF({
                    name: `${entity.firstName} ${entity.lastName}`,
                    studentId: entity.studentId,
                    amount: totalPaidAtStart,
                    date: new Date(),
                    receiptId: receiptId,
                    type: 'STUDENT'
                });

                await sendEmail({
                    email: entity.email,
                    subject: 'Payment Successful - HostelMate',
                    message: `Hello ${entity.firstName},\n\nYour payment of ₹${totalPaidAtStart} has been approved by the warden.\n\nYour remaining pending fee is ₹${entity.pendingFee}.\n\nPlease find your payment receipt attached.\n\nThank you!`,
                    attachments: [{
                        filename: `receipt_${receiptId}.pdf`,
                        content: pdfBuffer
                    }]
                });
            }
        } else {
            entity = await Guest.findById(req.params.id);
            if (entity) {
                const receiptId = `GRCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const amount = entity.totalFee || 0;

                entity.feeStatus = 'paid';
                entity.paymentHistory.push({
                    amount: amount,
                    date: new Date(),
                    method: entity.paymentMethod || 'CASH',
                    receiptId: receiptId
                });
                await entity.save();

                const pdfBuffer = await generateReceiptPDF({
                    name: entity.name,
                    amount: amount,
                    date: new Date(),
                    receiptId: receiptId,
                    type: 'GUEST'
                });

                await sendEmail({
                    email: entity.email,
                    subject: 'Payment Successful - HostelMate',
                    message: `Hello ${entity.name},\n\nYour payment of ₹${amount} has been approved by the warden.\n\nWe hope you enjoy your stay!\n\nPlease find your payment receipt attached.\n\nThank you!`,
                    attachments: [{
                        filename: `guest_receipt_${receiptId}.pdf`,
                        content: pdfBuffer
                    }]
                });
            }
        }

        if (entity) {
            res.json({ message: 'Payment approved and receipt sent', entity });
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
