import mongoose from 'mongoose';

const guestRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    wantsFood: { type: Boolean, default: false },
    wantsLaundry: { type: Boolean, default: false },
    feeStatus: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
    totalFee: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ['CASH', 'UPI', 'NONE'], default: 'NONE' },
    actionDate: { type: String },
    actionBy: { type: String },
    otp: { type: String }, // For guest login/verification
    roomNumber: { type: String },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, default: 'CASH' },
        receiptId: String
    }]
}, { timestamps: true });

export default mongoose.model('Guest', guestRequestSchema);
