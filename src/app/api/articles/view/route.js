// src/app/api/articles/view/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";

import "@/models/Category";
import "@/models/SubCategory";

export async function POST(request) {
  try {
    await dbConnect();
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}