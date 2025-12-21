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
            roomNumber: s.roomNumber,
            phone: s.phone,
            status: s.status,
            floor: s.floor,
            pendingFee: (s.feeStatus === 'unpaid' && (s.pendingFee === 0 || !s.pendingFee || s.pendingFee === 30000)) ? 21600 : s.pendingFee,
            messBill: s.messBill || (s.feeStatus === 'unpaid' ? 5000 : 0),
            gymBill: s.gymBill || (s.feeStatus === 'unpaid' ? 2000 : 0)
        }));

        res.json({
            students: studentList,
            rooms: rooms.map(r => ({
                id: r._id,
                roomNumber: r.roomNumber,
                capacity: r.capacity || 4,
                currentOccupancy: r.currentOccupancy || 0
            })),
            guestRequests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
