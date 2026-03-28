// src/app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import Author from "@/models/Author";
import User from "@/models/User";
import Category from "@/models/Category";
import { cookies } from 'next/headers';
import * as jose from 'jose';

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

async function isAuthenticated(request) {
  // 1. Check for API Key in headers
  const apikey = request?.headers?.get("x-api-key");
  if (apikey && apikey === SERVER_API_KEY) {
    return true;
  }

  // 2. Check for Session Token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!token) return false;

  try {
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const [postCount, authorCount, userCount, categoryCount, recentPosts] = await Promise.all([
      Post.countDocuments(),
      Author.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Post.find()
        .select('title slug created_at status author_id')
        .sort({ created_at: -1 })
        .limit(5)
        .populate('author_id', 'name')
        .lean()
    ]);

    return NextResponse.json({
      data: {
        totalPosts: postCount,
        totalAuthors: authorCount,
        totalUsers: userCount,
        totalCategories: categoryCount,
        recentPosts: recentPosts
      }
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: "Error fetching statistics" }, { status: 500 });
  }
}
