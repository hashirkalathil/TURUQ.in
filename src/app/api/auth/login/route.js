// src/app/api/auth/login/route.js
import dbConnect from "@/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { setSession, signToken } from "@/lib/auth"; // Import signToken

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        await dbConnect();
        
        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // 2. Check Password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // 3. Create Token using 'jose' (Standardized)
        const token = await signToken({ 
            userId: user._id.toString(), // Convert ObjectId to string
            name: user.name,
            email: user.email,
            role: user.role
        });

        // 4. Update User Stats (Last login & Count)
        // You had these fields in your model, let's use them!
        await User.findByIdAndUpdate(user._id, {
            $set: { last_login: new Date() },
            $inc: { login_count: 1 }
        });

        // 5. Set Cookie
        await setSession(token);

        return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}