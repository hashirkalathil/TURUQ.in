// src/app/api/auth/register/route.js

import dbConnect from "@/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req, res) {
  try {
    const { name, username, email, password } = await req.json();

    await dbConnect();

    const settings = await Settings.findOne().lean();
    if (settings?.super_admin_settings?.disable_public_registration) {
      return NextResponse.json(
        { message: "Registration is currently closed. Please contact an administrator." },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
        name,
        username,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: "Registration failed", error: error.message }, { status: 500 });
  }
}