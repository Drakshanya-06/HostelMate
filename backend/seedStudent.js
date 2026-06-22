import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

const createStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const email = 'harshita.kondamuri@gmail.com';
        const password = 'Harshita@2005';

        const existing = await Student.findOne({ email });
        if (existing) {
            console.log('Student already exists. Updating password and verifying...');
            existing.password = password;
            existing.isVerified = true;
            await existing.save();
            console.log('Student updated successfully.');
        } else {
            const student = new Student({
                firstName: 'Harshita',
                lastName: 'Kondamuri',
                email,
                password,
                studentId: `STU${Date.now()}`,
                parentsName: 'Mr. & Mrs. Kondamuri',
                phone: '+91 9999999999',
                hostelId: 1,
                floor: 1,
                roomNumber: 101,
                isVerified: true,
                pendingFee: 50000,
                messBill: 5000,
                gymBill: 2000,
                laundryBill: 1000,
                feeStatus: 'unpaid'
            });
            await student.save();
            console.log('Student Harshita Kondamuri created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createStudent();
