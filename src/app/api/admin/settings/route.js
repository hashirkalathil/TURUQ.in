// src/app/api/admin/settings/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Settings from "@/models/Settings";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

function validateApiKey(request) {
  const apiKey = request.headers.get("x-api-key");
  return apiKey === API_KEY;
}

export async function GET(request) {
  try {
    await dbConnect();
    let settings = await Settings.findOne().lean();

    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await dbConnect();

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ data: settings, message: "Settings updated successfully" });
  } catch (error) {
    console.error("PATCH settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
