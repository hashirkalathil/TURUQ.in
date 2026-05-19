// src/app/api/search/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/Post";
import "@/models/Author"; 
import "@/models/SubCategory";
import "@/models/Category"; // Required for deep population

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return '';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formattedMonth = monthNames[dateObj.getMonth()];
  return `${day} ${formattedMonth} ${year}`.toUpperCase();
};

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
        return NextResponse.json([]);
    }

    const searchRegex = new RegExp(query, 'i');

    const posts = await Post.find({
        status: 'published',
        title: { $regex: searchRegex }
    })
    .sort({ created_at: -1 })
    .limit(10) 
    .populate('author_id')
    // Deep populate: Get Subcategory -> Parent Category to build the URL
    .populate({
        path: 'subcategory_ids',
        populate: {
            path: 'parent_id',
            model: 'Category',
            select: 'slug'
        }
    })
    .lean();

    const results = posts.map(article => {
        const rawDate = article.created_at || article.created_at?.$date;
        const dateString = rawDate ? rawDate : new Date();

        let categories = [];
        if (Array.isArray(article.subcategory_ids)) {
            categories = article.subcategory_ids
                .filter(sub => sub && sub.name && sub.slug)
                .map(sub => {
                    // formatting: /{categorySlug}/{subcategorySlug}
                    const parentSlug = sub.parent_id?.slug || 'general';
                    const subSlug = sub.slug;
                    
                    return {
                        name: sub.name.toUpperCase(),
                        link: `/category/${parentSlug}/${subSlug}` // Added /category prefix for standard routing, remove if your route is literally just /parent/sub
                    };
                })
                .slice(0, 2);
        }
        
        if (categories.length === 0) {
            categories = [{ name: 'GENERAL', link: '/category/general' }];
        }

        return {
            id: article._id.toString(),
            title: article.title || 'Untitled',
            author: article.author_id?.name || 'Anonymous',
            date: formatDate(dateString),
            categories: categories, // Now returns objects { name, link }
            link: `/${article.slug}`, // Article link
            image: article.featured_image || 'https://placehold.co/200x150/ccc/333?text=Image+Missing',
        };
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}