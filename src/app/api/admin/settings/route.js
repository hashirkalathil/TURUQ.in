// src/app/api/admin/settings/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Settings from "@/models/Settings";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.role;
    const isAdmin = role === "admin" || role === "super-admin";
    const isSuperAdmin = role === "super-admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json({ error: "Missing section or data" }, { status: 400 });
    }

    // Determine which fields are allowed based on role & section
    let updatePayload = {};

    if (section === "permissions" && isAdmin) {
      // Use dot notation to avoid overwriting other sections or missing keys
      for (const key in data) {
        updatePayload[`permissions.${key}`] = data[key];
      }
    } else if (section === "super_admin_settings" && isSuperAdmin) {
      for (const key in data) {
        updatePayload[`super_admin_settings.${key}`] = data[key];
      }
    } else {
      return NextResponse.json({ 
        error: "Forbidden: insufficient role for this section" 
      }, { status: 403 });
    }

    await dbConnect();

    // Use atomic update to avoid race conditions or accidental object replacement
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { 
        new: true, 
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true 
      }
    );

    return NextResponse.json({ 
      data: settings, 
      message: "Settings updated successfully" 
    });
  } catch (error) {
    console.error("PATCH settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
