import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    hostelId: { type: Number, required: true },
    floor: { type: Number, required: true },
    number: { type: Number, required: true },
    capacity: { type: Number, enum: [2, 3], required: true },
    occupants: [{ type: String }],
    type: { type: String, enum: ['AC', 'Non-AC'], required: true },
    isVacant: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Hostel', roomSchema);
