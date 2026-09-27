import mongoose from 'mongoose';
import { ENV } from './env.js';

export let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  if (!ENV.MONGODB_URI) {
    console.log('⚡ [DB] No MONGODB_URI configured. Running with high-performance In-Memory Geospatial Engine.');
    return false;
  }

  try {
    console.log(`📡 [DB] Attempting connection to MongoDB at: ${ENV.MONGODB_URI}`);
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout so server starts instantaneously
    });
    isMongoConnected = true;
    console.log('✅ [DB] Successfully connected to MongoDB with 2dsphere Geospatial Indexing enabled.');
    return true;
  } catch (err: any) {
    console.warn('⚠️ [DB] MongoDB not detected locally (or timed out).');
    console.log('🛡️ [DB] Seamlessly switched to RAKSHA High-Precision In-Memory Geospatial Datastore.');
    isMongoConnected = false;
    return false;
  }
}
