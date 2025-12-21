import Guest from '../models/Guest.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create Guest Request
// @route   POST /api/guest/request
// @access  Public
export const createGuestRequest = async (req, res) => {
    try {
        const { name, email, phone, checkIn, checkOut, wantsFood, wantsLaundry, totalFee } = req.body;

        const request = await Guest.create({
            name,
            email,
            phone,
            checkIn,
            checkOut,
            wantsFood,
            wantsLaundry,
            totalFee: totalFee || 0,
            feeStatus: 'unpaid'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (other functions)

// @desc    Pay Guest Fee
// @route   POST /api/guest/pay-fee
// @access  Public
export const payGuestFee = async (req, res) => {
    try {
        const { email } = req.body;
        const guest = await Guest.findOne({ email }).sort({ createdAt: -1 });

        if (guest) {
            if (guest.feeStatus === 'pending') {
                return res.status(400).json({ message: 'Payment already pending approval' });
            }
            if (guest.feeStatus === 'paid') {
                return res.status(400).json({ message: 'Fee already paid' });
            }

            guest.feeStatus = 'pending';
            guest.paymentMethod = 'CASH';

            await guest.save();
            res.json({ message: 'Payment recorded and pending warden approval', guest });
        } else {
            res.status(404).json({ message: 'Guest request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Guest Status
// @route   PUT /api/guest/:id
// @access  Private/Admin
export const updateGuestStatus = async (req, res) => {
    try {
        const { status, actionBy } = req.body;
        const guest = await Guest.findById(req.params.id);

        if (guest) {
            const oldStatus = guest.status;
            guest.status = status;
            guest.actionBy = actionBy || 'Admin';
            guest.actionDate = new Date().toISOString();

            // If approved, generate OTP and send email
            if (status === 'approved' && oldStatus !== 'approved') {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const roomNo = `R-${Math.floor(100 + Math.random() * 900)}`;
                guest.otp = otp;
                guest.roomNumber = roomNo;

                await sendEmail({
                    email: guest.email,
                    subject: 'Booking Confirmed - HostelMate',
                    message: `Hello ${guest.name},\n\nYour stay request has been APPROVED!\n\nBooking Details:\nDates: ${guest.checkIn} to ${guest.checkOut}\nRoom Number: ${roomNo}\n\nYour Login OTP: ${otp}\n\nWe look forward to welcoming you!`
                });
            }

            const updatedGuest = await guest.save();
            res.json(updatedGuest);
        } else {
            res.status(404).json({ message: "Guest request not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Guest Request Status
// @route   GET /api/guest/status
// @access  Public
export const getGuestRequestStatus = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const requests = await Guest.find({ email }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
