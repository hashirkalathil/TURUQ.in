// src/models/Author.js

import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema({
  // Name of the author (required and must be unique for main identification)
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // Unique URL-friendly identifier for the author
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Author's email (required and unique)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Author's phone number (optional)
  phone: {
    type: String,
    trim: true,
  },
  // A brief biography or description of the author (optional)
  biography: {
    type: String,
  },
  // Path to the author's avatar image file (optional)
  avatar: {
    type: String,
  },
  // General status (e.g., 'active', 'inactive', 'pending')
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  // Boolean flag for quick activation/deactivation
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  // Use a specific collection name
  collection: 'authors',
  // Enable Mongoose timestamps to manage created_at and updated_at
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Export the model, preventing re-compilation in Next.js environment
export default mongoose.models.Author || mongoose.model('Author', AuthorSchema);