import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import guestRoutes from './routes/guest.js';

dotenv.config();

connectDB().catch(err => {
    console.error('Initial MongoDB connection failed:', err.message);
});

const app = express();

app.use(cors());
app.use(express.json());

// Database connection verification middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection middleware caught error:', err.message);
        res.status(500).json({
            message: 'Database connection failed: ' + err.message
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guest', guestRoutes);

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
