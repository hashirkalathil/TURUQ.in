// src/app/api/admin/categories/route.js

import Category from "@/models/Category";
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import { checkPermission } from "@/lib/permissions";

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString().toLowerCase();
  return slug
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export async function GET(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in GET /categories:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");

  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error(
      "Auth failed. Received:",
      apikey ? "key present" : "no key",
      "Expected:",
      SERVER_API_KEY ? "key configured" : "no key configured"
    );
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await Category.find().sort({ created_at: -1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /categories:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");

  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error("Auth failed in POST");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  const { blocked } = await checkPermission(req, "disable_create_categories");
  if (blocked) return blocked;

  let data;

  try {
    data = await req.json();

    let categorySlug = data.slug;
    if (!categorySlug || categorySlug.trim() === "") {
      if (!data.name) {
        return NextResponse.json(
          { message: "Name is required to create category." },
          { status: 400 }
        );
      }
      categorySlug = slugify(data.name);
    }

    const newCategory = new Category({
      name: data.name,
      slug: categorySlug,
      description: data.description,
      type: data.type,
      post_count: 0,
    });

    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Category creation error:", error);

    if (error.code === 11000) {
      const name = data?.name ? `'${data.name}'` : "A category";
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
      { message: "Error creating category: Internal Server Error" },
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

  // Check permission
  const { blocked } = await checkPermission(req, "disable_edit_category");
  if (blocked) return blocked;

  try {
    const data = await req.json();
    const { id, name, slug, description } = data;

    if (!id) {
      return NextResponse.json(
        { message: "Category ID is required." },
        { status: 400 }
      );
    }

    if (slug) {
      const existing = await Category.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { message: "Slug already exists." },
          { status: 409 }
        );
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, slug, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { message: "Category not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Error updating category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in DELETE /categories:", e);
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  }

  const apikey = req.headers.get("x-api-key");
  if (!apikey || apikey !== SERVER_API_KEY) {
    console.error("Auth failed in DELETE");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  const { blocked } = await checkPermission(req, "disable_delete_categories");
  if (blocked) return blocked;

  let data;
  try {
    data = await req.json();
    const id = data?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Category ID is required for deletion." },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { message: "Category not found or already deleted." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "Category deleted successfully.",
      deletedId: id,
      deletedCategory,
    });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { message: "Error deleting category: Internal Server Error" },
      { status: 500 }
    );
  }
}
