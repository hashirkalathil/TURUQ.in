// src/app/api/admin/posts/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import Author from "@/models/Author";
import * as jose from 'jose';
import { cookies } from 'next/headers';
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import { checkPermission } from "@/lib/permissions";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const SERVER_API_KEY = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;

async function isAuthenticated(request) {
  // 1. Check for API Key in headers
  const apikey = request?.headers?.get("x-api-key");
  if (apikey && apikey === SERVER_API_KEY) {
    return true;
  }

  // 2. Check for Session Token in cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (!token) return false;

  try {
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (postId) {
      const post = await Post.findById(postId)
        .populate('author_id', 'name email avatar')
        .populate('category_ids', 'name slug')
        .populate('subcategory_ids', 'name slug')
        .lean();
      if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });
      return NextResponse.json({ data: post });
    }

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;
    
    const isSlide = searchParams.get('is_slide') === 'true';
    const notSlide = searchParams.get('not_slide') === 'true';
    
    let query = {};
    if (isSlide) {
      query = { "permissions.is_slide_article": true };
    } else if (notSlide) {
      query = { "permissions.is_slide_article": { $ne: true }, status: 'published' };
    }

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select('-content -blocks -markdown')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author_id', 'name avatar')
      .populate('category_ids', 'name')
      .populate('subcategory_ids', 'name')
      .lean();

    return NextResponse.json({
      data: posts,
      pagination: { total: totalPosts, page, pages: Math.ceil(totalPosts / limit) }
    });

  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ message: "Error fetching posts" }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  const { blocked } = await checkPermission(request, "disable_new_posts");
  if (blocked) return blocked;

  try {
    await dbConnect();
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }

    if (data.author_id) {
      const authorExists = await Author.findById(data.author_id);
      if (!authorExists) {
        return NextResponse.json({ message: 'Invalid Author ID provided.' }, { status: 400 });
      }
    }

    let postSlug = data.slug ? slugify(data.slug) : slugify(data.title);

    const existingPost = await Post.findOne({ slug: postSlug });
    if (existingPost) {
      postSlug = `${postSlug}-${Math.floor(Math.random() * 10000)}`;
    }

    const permissions = {
      is_slide_article: data.permissions?.is_slide_article || false,
      is_premium: data.permissions?.is_premium || false,
      is_featured: data.permissions?.is_featured || false,
    };

    const newPost = new Post({
      ...data,
      slug: postSlug,
      views: 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || "").split(",").map(t => t.trim()).filter(Boolean),
      permissions: permissions,
      category_ids: data.category_ids || [],
      subcategory_ids: data.subcategory_ids || [],
    });

    await newPost.save();
    return NextResponse.json({ data: newPost }, { status: 201 });

  } catch (error) {
    console.error("POST Error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key error (Slug)' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const { _id, slug: incomingSlug, title, permissions, ...updateData } = data;

    if (!_id) {
      return NextResponse.json({ message: 'Post ID is required.' }, { status: 400 });
    }

    // Check slide-specific permissions when toggling is_slide_article
    if (permissions?.is_slide_article === true) {
      const { blocked } = await checkPermission(request, "disable_add_to_slides");
      if (blocked) return blocked;
    } else if (permissions?.is_slide_article === false) {
      const { blocked } = await checkPermission(request, "disable_remove_from_slides");
      if (blocked) return blocked;
    }

    // Slug Logic
    let finalSlug = undefined;
    if (incomingSlug || title) {
      const base = incomingSlug && incomingSlug.trim() !== '' ? incomingSlug : title;
      if (base) {
        finalSlug = slugify(base);
        const conflict = await Post.findOne({ slug: finalSlug, _id: { $ne: _id } });
        if (conflict) {
          return NextResponse.json({ error: `Slug '${finalSlug}' is already taken.` }, { status: 409 });
        }
      }
    }

    const update = {
      ...updateData,
      tags: Array.isArray(updateData.tags) ? updateData.tags : (updateData.tags || []),
      subcategory_ids: updateData.subcategory_ids || [],
      category_ids: updateData.category_ids || [],
    };

    if (title) update.title = title;
    if (finalSlug) update.slug = finalSlug;

    // Handle permissions update if provided
    if (permissions) {
      update.permissions = {
        is_slide_article: permissions.is_slide_article,
        is_premium: permissions.is_premium,
        is_featured: permissions.is_featured,
      };
    }

    delete update.views;
    delete update.created_at;

    const updatedPost = await Post.findByIdAndUpdate(
      _id,
      update,
      { new: true, runValidators: true }
    )
      .populate('author_id')
      .populate('category_ids')
      .populate('subcategory_ids');

    if (!updatedPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedPost });

  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Check permission
  const { blocked } = await checkPermission(request, "disable_delete_post");
  if (blocked) return blocked;

  try {
    await dbConnect();

    let idToDelete = null;
    const { searchParams } = new URL(request.url);
    idToDelete = searchParams.get('id');

    if (!idToDelete) {
      try {
        const body = await request.json();
        idToDelete = body._id || body.id;
      } catch (e) {
        console.error(e);
      }
    }

    if (!idToDelete) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const deleted = await Post.findByIdAndDelete(idToDelete);

    if (!deleted) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { _id, webzine_id } = body;

    if (!_id) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      _id,
      { webzine_id: webzine_id },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedPost });

  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}