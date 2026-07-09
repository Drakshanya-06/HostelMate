import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

// Replace the password below with your actual MongoDB Atlas password (URL‑encoded if it contains special characters)
const uri = process.env.MONGODB_URI; // pulled from .env

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.info('✅ Successfully connected to MongoDB');
    return client;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
  console.info('🔌 MongoDB connection closed');
}
