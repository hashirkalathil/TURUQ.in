import { dbConnect } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, name, whatsapp } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        if (name) existing.name = name;
        if (whatsapp) existing.whatsapp = whatsapp;
        await existing.save();
        return NextResponse.json({ 
          message: "Welcome back! You have re-subscribed.", 
          status: "updated" 
        }, { status: 200 });
      }

      // Check if name or whatsapp changed
      const nameChanged = name && existing.name !== name;
      const whatsappChanged = whatsapp && existing.whatsapp !== whatsapp;

      if (nameChanged || whatsappChanged) {
        if (name) existing.name = name;
        if (whatsapp) existing.whatsapp = whatsapp;
        await existing.save();
        return NextResponse.json({ 
          message: "Your subscription details have been updated successfully!", 
          status: "updated" 
        }, { status: 200 });
      }

      return NextResponse.json({ 
        message: "You are already a subscriber. now join our community if not already joined.", 
        status: "no_changes" 
      }, { status: 200 });
    }

    await Subscriber.create({ email, name: name || null, whatsapp: whatsapp || null });
    return NextResponse.json({ 
      message: "Success, you are now a subscriber. join our community.", 
      status: "created" 
    }, { status: 201 });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
