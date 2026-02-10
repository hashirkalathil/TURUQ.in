// src/app/api/admin/posts/imageUpload/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Converts a File or Blob object into a Base64 Data URL string.
 * This is the correct format for uploading raw file data to Cloudinary via Node.js SDK.
 * @param {File} file
 * @returns {Promise<string>}
 */

async function bufferToDataUrl(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function POST(req) {
  const apikey = req.headers.get("x-api-key");
  if (!apikey || apikey !== SERVER_API_KEY) {
    return NextResponse.json(
      { message: "Unauthorized: Invalid API Key" },
      { status: 401 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No image file provided." },
      { status: 400 }
    );
  }

  try {
    const dataUrl = await bufferToDataUrl(file);

    const folder = formData.get("folder") || "turuq";
    const publicId = formData.get("public_id");

    const uploadOptions = {
      folder: folder,
      resource_type: "auto",
      format: "webp",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
      uploadOptions.invalidate = true;
    }

    const uploadResult = await cloudinary.uploader.upload(dataUrl, uploadOptions);

    return NextResponse.json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
