// src/models/Webzine.js
import mongoose from 'mongoose';

const WebzineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Webzine name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cover_image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    published_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export default mongoose.models.Webzine || mongoose.model('Webzine', WebzineSchema);