import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find(
      {},
      "name slug _id description"
    ).sort({ name: 1 }); // Alphabetical order usually looks best

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Public Category Fetch Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
