import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import SubCategory from "@/models/SubCategory";

export async function GET() {
  try {
    await dbConnect();

    const subcategories = await SubCategory.find(
      {},
      "name slug parent_id _id"
    ).sort({ name: 1 });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Public Subcategory Fetch Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
