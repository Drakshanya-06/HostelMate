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
                profilePhoto: '/student-profile.png'
            }
        },
        { new: true }
    );

    if (result) {
        console.log('✅ Profile photo updated for:', result.email);
        console.log('   New photo path:', result.profilePhoto);
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
