import { NextResponse } from 'next/server';
import dbConnect from '@/mongodb';
import Post from '@/models/Post';

export async function GET() {
  await dbConnect();

  try {
    const result = await Post.updateMany(
      { webzine_id: { $exists: false } }, 
      { $set: { webzine_id: null } }
    );

    return NextResponse.json({ 
      message: 'Migration successful', 
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}