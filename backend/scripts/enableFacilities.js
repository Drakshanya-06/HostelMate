import mongoose from 'mongoose';
import Student from '../models/Student.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Student.findOneAndUpdate(
        { email: 'harshita.kondamuri@gmail.com' },
        {
            $set: {
                hasMess: true,
                hasLaundry: true,
                hasGym: true,
                isVerified: true
            }
        },
        { new: true }
    );

    if (result) {
        console.log('✅ Facilities enabled for:', result.email);
        console.log('   hasMess:', result.hasMess);
        console.log('   hasLaundry:', result.hasLaundry);
        console.log('   hasGym:', result.hasGym);
        console.log('   studentId:', result.studentId);
    } else {
        console.log('❌ Student not found');
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
