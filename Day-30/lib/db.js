// lib/db.js — Reusable MongoDB connection (optimized for Vercel serverless)
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'titan_marketplace';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Cache the client across hot-reloads in development & serverless invocations
let cachedClient = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb() {
  const client = await connectToDatabase();
  return client.db(DB_NAME);
}