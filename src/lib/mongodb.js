// src/lib/mongodb.js

import mongoose from "mongoose";
import Post from "@/models/Post";
import Author from "@/models/Author";
import SubCategory from "@/models/SubCategory";
import Category from '@/models/Category';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Global database connection helper
 * @returns {Promise<import('mongoose').Mongoose>} The active Mongoose connection object.
 */
export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Fetches a single Post by its slug, populating the Author details.
 * @param {string} slug The unique URL-friendly identifier for the post.
 * @returns {Promise<Object|null>} The populated post object or null if not found.
 */
export async function getArticle(slug) {
  try {
    await dbConnect();

    const article = await Post.findOne({ slug: slug })
      .populate({
        path: "author_id",
        model: Author,
        select: "name slug avatar biography",
      })
      .populate({
        path: 'category_ids',
        model: Category,
        select: 'name slug',
      })
      .populate({
        path: 'subcategory_ids',
        model: SubCategory,
        select: 'name slug parent_id',
        populate: {
          path: 'parent_id',
          model: Category,
          select: 'slug'
        }
      })
      .lean();

    return article;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}