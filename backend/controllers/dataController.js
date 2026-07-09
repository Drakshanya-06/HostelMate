import Student from '../models/Student.js';
import Room from '../models/Hostel.js'; // Assuming Hostel.js defines Room or Hostel model
import Guest from '../models/Guest.js';

// @desc    Get Dashboard Data
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
    try {
        const students = await Student.find({}).select('-password');
        // Check if Room model is defaulted or how it's named. 
        // Using generic find if possible, or empty array if model issues.
        let rooms = [];
        try {
            rooms = await Room.find({});
        } catch (e) { console.log('Room fetch error', e); }

        const guestRequests = await Guest.find({}).sort({ createdAt: -1 });

        const studentList = students.map(s => ({
            id: s.studentId || s._id,
            studentId: s.studentId || s._id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            firstName: s.firstName,
            lastName: s.lastName,
            roomNumber: s.roomNumber,
            phone: s.phone,
            status: s.status,
            floor: s.floor,
            pendingFee: s.pendingFee || 0,
            messBill: s.messBill || 0,
            gymBill: s.gymBill || 0,
            laundryBill: s.laundryBill || 0,
            feeStatus: s.feeStatus || 'unpaid',
            profilePhoto: s.profilePhoto || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=random&color=fff&size=200`
        }));

        res.json({
            students: studentList,
            rooms: rooms.map(r => ({
                id: r._id,
                roomNumber: r.number,
                capacity: r.capacity || 4,
                currentOccupancy: Array.isArray(r.occupants) ? r.occupants.length : (r.currentOccupancy || 0)
            })),
            guestRequests: guestRequests.map(g => ({
                id: g._id,
                name: g.name,
                email: g.email,
                phone: g.phone,
                checkIn: g.checkIn,
                checkOut: g.checkOut,
                status: g.status,
                wantsFood: g.wantsFood,
                wantsLaundry: g.wantsLaundry,
                feeStatus: g.feeStatus,
                totalFee: g.totalFee,
                paymentMethod: g.paymentMethod,
                actionDate: g.actionDate,
                actionBy: g.actionBy,
                roomNumber: g.roomNumber,
                otp: g.otp,
                createdAt: g.createdAt,
                updatedAt: g.updatedAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
