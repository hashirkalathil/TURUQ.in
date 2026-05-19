// src/mongodb.js

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development, which prevents connections growing exponentially.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // 1. Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Start connection if no promise exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Prevents operations from buffering indefinitely
    };

    // Create the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  // 3. Wait for the promise to resolve, clearing it on failure
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // CRITICAL: If the connection fails, clear the cached promise
    // so the next attempt tries to connect fresh, rather than waiting
    // on the perpetually failing promise.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
