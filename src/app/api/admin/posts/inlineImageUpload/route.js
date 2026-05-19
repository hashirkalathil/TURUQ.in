// src/app/api/admin/posts/inlineImageUpload/route.js
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

export async function POST(request) {
  // 1. Authentication Check
  const apikey = request.headers.get("x-api-key");
  if (!apikey || apikey !== SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to buffer and then to base64 data URI
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 2. Upload to Cloudinary with specific folder and format
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'turuq/posts/', 
      format: 'webp',         
      transformation: [
        { width: 1200, crop: 'limit' } 
      ]
    });

    // 3. Return the secure URL
    return NextResponse.json({ 
      imageUrl: uploadResult.secure_url 
    }, { status: 201 });

  } catch (error) {
    console.error('Cloudinary inline image upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload image', error: error.message },
      { status: 500 }
    );
  }
}