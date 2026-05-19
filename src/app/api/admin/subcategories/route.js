// src/app/api/admin/subcategories/route.js

import SubCategory from "@/models/SubCategory";
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb"; 

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

// Utility function 
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export async function GET(req, res) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in GET /subcategories:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");

  if (apikey != SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const subcategories = await SubCategory.find().sort({ created_at: -1 });
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /subcategories:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");
  if (apikey != SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = await req.json();

    if (!data.parent_id) {
      return NextResponse.json(
        { message: "Parent Category (parent_id) is required for sub-categories." },
        { status: 400 }
      );
    }

    let subCategorySlug = data.slug;
    if (!subCategorySlug || subCategorySlug.trim() === "") {
      if (!data.name) {
        return NextResponse.json(
          { message: "Name is required to create category." },
          { status: 400 }
        );
      }
      subCategorySlug = slugify(data.name);
    }

    const newSubCategory = new SubCategory({
      name: data.name,
      slug: subCategorySlug,
      description: data.description,
      parent_id: data.parent_id,
      type: data.type,
      post_count: 0,
    });

    await newSubCategory.save();
    return NextResponse.json(newSubCategory, { status: 201 });
  } catch (error) {
    console.error("Category creation error:", error);

    if (error.code === 11000) {
      const name = data?.name ? `'${data.name}'` : "A sub category";
      const slug = data?.slug ? ` or slug '${data.slug}'` : "";
      return NextResponse.json(
        { message: `${name}${slug} already exists.` },
        { status: 409 }
      );
    }
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: `Validation failed: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Error creating sub category: Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
  } catch (e) {
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");
  if (!apikey || apikey !== SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, name, slug, description, parent_id } = data;

    if (!id) {
      return NextResponse.json(
        { message: "SubCategory ID is required." },
        { status: 400 }
      );
    }

    // Checking parent_id is crucial for subcategories
    if (!parent_id) {
      return NextResponse.json(
        { message: "Parent Category ID is required." },
        { status: 400 }
      );
    }

    // Check uniqueness of slug (excluding the current document)
    if (slug) {
      const existing = await SubCategory.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { message: "Slug already exists." },
          { status: 409 }
        );
      }
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name, slug, description, parent_id },
      { new: true, runValidators: true }
    );

    if (!updatedSubCategory) {
      return NextResponse.json(
        { message: "SubCategory not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSubCategory, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Error updating sub-category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
  } catch (e) {
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");
  if (!apikey || apikey !== SERVER_API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const id = data?.id;

    if (!id) {
      return NextResponse.json(
        { message: "SubCategory ID is required for deletion." },
        { status: 400 }
      );
    }

    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return NextResponse.json(
        { message: "SubCategory not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: "SubCategory deleted successfully.",
        deletedId: id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Error deleting sub-category" },
      { status: 500 }
    );
  }
}