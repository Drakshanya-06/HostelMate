import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    parentsName: { type: String, required: true },
    phone: { type: String, required: true },
    hostelId: { type: Number, required: true },
    floor: { type: Number, required: true },
    roomNumber: { type: Number, required: true },
    pendingFee: { type: Number, default: 50000 },
    messBill: { type: Number, default: 5000 },
    gymBill: { type: Number, default: 2000 },
    laundryBill: { type: Number, default: 1000 },
    hasMess: { type: Boolean, default: false },
    hasLaundry: { type: Boolean, default: false },
    hasGym: { type: Boolean, default: false },
    feeStatus: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['CASH', 'UPI', 'NONE'], default: 'NONE' },
    lastPaymentDetails: {
        amount: Number,
        date: Date
    },
    status: { type: String, enum: ['active', 'graduated', 'suspended'], default: 'active' },
    profilePhoto: { type: String },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: {
        code: String,
        expiresAt: Date
    },
    recoveryOtp: {
        code: String,
        expiresAt: Date
    },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, default: 'CASH' },
        receiptId: String
    }]
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('Student', studentSchema);
