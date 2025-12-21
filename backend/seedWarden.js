import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const createWarden = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const email = 'drakshanyachess@gmail.com';
        const password = 'Sweety@2006';
        const name = 'Drakshanya Warden';

        const existingWarden = await Admin.findOne({ email });
        if (existingWarden) {
            console.log('Warden already exists. Updating password...');
            existingWarden.password = password;
            existingWarden.role = 'WARDEN';
            await existingWarden.save();
        } else {
            const newWarden = new Admin({
                name,
                email,
                password,
                role: 'WARDEN',
                isVerified: true
            });
            await newWarden.save();
            console.log('Warden created successfully.');
        }

        process.exit();
    } catch (error) {
        console.error('Error creating warden:', error);
        process.exit(1);
    }
};

createWarden();
