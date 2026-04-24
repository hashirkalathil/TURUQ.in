import { dbConnect } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return NextResponse.json({ message: "Welcome back! You have re-subscribed." }, { status: 200 });
      }
      return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
    }

    await Subscriber.create({ email });
    return NextResponse.json({ message: "Thank you for subscribing to our newsletter!" }, { status: 201 });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
