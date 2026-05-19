import { dbConnect } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";

// GET all subscribers
export async function GET(req) {
  try {
    await dbConnect();
    const subscribers = await Subscriber.find({}).sort({ created_at: -1 }).lean();
    return NextResponse.json(subscribers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

// DELETE a subscriber
export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();
    await Subscriber.findByIdAndDelete(id);
    return NextResponse.json({ message: "Subscriber removed" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
  }
}
