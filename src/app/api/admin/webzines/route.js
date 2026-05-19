// src/app/api/admin/webzines/route.js

import Webzine from "@/models/Webzine";
import Post from "@/models/Post";
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
    console.error("Database connection failed in GET /webzines:", e);
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
    const webzines = await Webzine.find().sort({ created_at: -1 });
    return NextResponse.json(webzines);
  } catch (error) {
    console.error("Error fetching webzines:", error);
    return NextResponse.json(
      { message: "Error fetching webzines" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in POST /webzines:", e);
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
  const { blocked } = await checkPermission(req, "disable_create_webzines");
  if (blocked) return blocked;

  let data;

  try {
    data = await req.json();

    let webzineSlug = data.slug;
    if (!webzineSlug || webzineSlug.trim() === "") {
      if (!data.name) {
        return NextResponse.json(
          { message: "Name is required to create a webzine." },
          { status: 400 }
        );
      }
      webzineSlug = slugify(data.name);
    }

    const newWebzine = new Webzine({
      name: data.name,
      slug: webzineSlug,
      description: data.description,
      cover_image: data.cover_image,
      status: data.status || 'draft',
      published_at: data.published_at,
    });

    await newWebzine.save();
    return NextResponse.json(newWebzine, { status: 201 });

  } catch (error) {
    console.error("Webzine creation error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: `A webzine with this slug already exists.` },
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
      { message: "Error creating webzine: Internal Server Error" },
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
  const { blocked } = await checkPermission(req, "disable_edit_webzines");
  if (blocked) return blocked;

  try {
    const data = await req.json();
    const { id, name, slug, description, cover_image, status, published_at } = data;

    if (!id) {
      return NextResponse.json(
        { message: "Webzine ID is required." },
        { status: 400 }
      );
    }

    if (slug) {
      const existing = await Webzine.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { message: "Slug already exists on another webzine." },
          { status: 409 }
        );
      }
    }

    const updatedWebzine = await Webzine.findByIdAndUpdate(
      id,
      { name, slug, description, cover_image, status, published_at },
      { new: true, runValidators: true }
    );

    if (!updatedWebzine) {
      return NextResponse.json(
        { message: "Webzine not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedWebzine, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Error updating webzine" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("Database connection failed in DELETE /webzines:", e);
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
  const { blocked } = await checkPermission(req, "disable_delete_webzines");
  if (blocked) return blocked;

  let data;
  try {
    data = await req.json();
    const id = data?.id;

    if (!id) {
      return NextResponse.json(
        { message: "Webzine ID is required for deletion." },
        { status: 400 }
      );
    }

    const deletedWebzine = await Webzine.findByIdAndDelete(id);

    if (!deletedWebzine) {
      return NextResponse.json(
        { message: "Webzine not found or already deleted." },
        { status: 404 }
      );
    }

    await Post.updateMany(
      { webzine_id: id },
      { $set: { webzine_id: null } }
    );

    return NextResponse.json({
      message: "Webzine deleted successfully.",
      deletedId: id,
      deletedWebzine,
    });
  } catch (error) {
    console.error("Webzine deletion error:", error);
    return NextResponse.json(
      { message: "Error deleting webzine: Internal Server Error" },
      { status: 500 }
    );
  }
}