// src/app/api/users/route.js

import dbConnect from "@/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  const apikey = req.headers.get("x-api-key");

  if (apikey !== process.env.API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  await dbConnect();
  const users = await User.find({});
  return NextResponse.json(users);
}