import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Student from './models/Student.js';
import Guest from './models/Guest.js';
import Hostel from './models/Hostel.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const wardenEmail = 'warden@example.com';
        const wardenPassword = 'Warden@123';
        const existingWarden = await Admin.findOne({ email: wardenEmail });
        if (existingWarden) {
            existingWarden.password = wardenPassword;
            existingWarden.role = 'WARDEN';
            existingWarden.isVerified = true;
            await existingWarden.save();
            console.log('Warden updated.');
        } else {
            await Admin.create({
                name: 'Hostel Warden',
                email: wardenEmail,
                password: wardenPassword,
                role: 'WARDEN',
                isVerified: true
            });
            console.log('Warden created.');
        }

        const students = [
            {
                firstName: 'Aarav',
                lastName: 'Mehta',
                email: 'aarav.mehta@example.com',
                password: 'Student@123',
                studentId: 'STU1001',
                parentsName: 'Mr. Mehta',
                phone: '+919876543210',
                hostelId: 1,
                floor: 1,
                roomNumber: 101,
                isVerified: true,
                pendingFee: 32000,
                messBill: 5000,
                gymBill: 2000,
                laundryBill: 1000,
                feeStatus: 'unpaid'
            },
            {
                firstName: 'Naina',
                lastName: 'Patel',
                email: 'naina.patel@example.com',
                password: 'Student@123',
                studentId: 'STU1002',
                parentsName: 'Mrs. Patel',
                phone: '+919123456780',
                hostelId: 1,
                floor: 1,
                roomNumber: 102,
                isVerified: true,
                pendingFee: 0,
                messBill: 0,
                gymBill: 0,
                laundryBill: 0,
                feeStatus: 'paid'
            }
        ];

        for (const studentData of students) {
            const existing = await Student.findOne({ email: studentData.email });
            if (existing) {
                Object.assign(existing, studentData);
                await existing.save();
                console.log(`Updated student ${studentData.email}`);
            } else {
                await Student.create(studentData);
                console.log(`Created student ${studentData.email}`);
            }
        }

        const rooms = [
            { hostelId: 1, floor: 1, number: 101, capacity: 2, occupants: ['STU1001'], type: 'Non-AC' },
            { hostelId: 1, floor: 1, number: 102, capacity: 2, occupants: ['STU1002'], type: 'AC' },
            { hostelId: 2, floor: 2, number: 201, capacity: 3, occupants: [], type: 'Non-AC' }
        ];

        for (const roomData of rooms) {
            const existing = await Hostel.findOne({ hostelId: roomData.hostelId, number: roomData.number });
            if (existing) {
                Object.assign(existing, roomData);
                await existing.save();
                console.log(`Updated room ${roomData.number}`);
            } else {
                await Hostel.create(roomData);
                console.log(`Created room ${roomData.number}`);
            }
        }

        const guests = [
            {
                name: 'Rahul Sharma',
                email: 'rahul.sharma@example.com',
                phone: '+919988776655',
                checkIn: '2024-07-15',
                checkOut: '2024-07-18',
                wantsFood: true,
                wantsLaundry: false,
                status: 'pending',
                feeStatus: 'pending',
                totalFee: 4500,
                paymentMethod: 'CASH'
            },
            {
                name: 'Sanya Gupta',
                email: 'sanya.gupta@example.com',
                phone: '+919876501234',
                checkIn: '2024-07-20',
                checkOut: '2024-07-22',
                wantsFood: true,
                wantsLaundry: true,
                status: 'approved',
                feeStatus: 'paid',
                totalFee: 6200,
                paymentMethod: 'CASH',
                actionDate: new Date().toISOString(),
                actionBy: 'WARDEN',
                roomNumber: '201',
                otp: '438902'
            }
        ];

        for (const guestData of guests) {
            const existing = await Guest.findOne({ email: guestData.email, name: guestData.name });
            if (existing) {
                Object.assign(existing, guestData);
                await existing.save();
                console.log(`Updated guest ${guestData.email}`);
            } else {
                await Guest.create(guestData);
                console.log(`Created guest ${guestData.email}`);
            }
        }

        console.log('Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();