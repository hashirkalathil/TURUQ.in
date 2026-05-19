// src/lib/data.js

import { dbConnect } from "./mongodb";
import Post from "@/models/Post";

const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return 'Unknown Date';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const formattedMonth = monthNames[dateObj.getMonth()];

    return `${day} ${formattedMonth} ${year}`.toUpperCase();
};

export async function getHomeArticleData() {
    await dbConnect();

    try {
        const posts = await Post.find({ status: 'published' })
            .sort({ created_at: -1 })
            .populate('author_id')
            .populate('subcategory_ids')
            .lean()
            .exec();

        const allMappedArticles = posts
            .map(article => mapArticleData(article));

        const featuredArticles = allMappedArticles
            .filter(a => a.is_featured)
            .slice(0, 4);

        const mostRecentArticles = allMappedArticles;

        return { featuredArticles, mostRecentArticles };
    } catch (error) {
        console.error("Database Fetch Error for Home Page:", error);
        return {
            featuredArticles: [],
            mostRecentArticles: [],
        };
    }
}



const mapArticleData = (article) => {
    const rawDate = article.created_at || article.created_at?.$date;
    const dateString = rawDate ? rawDate : new Date();

    let authorName = 'Anonymous Writer';

    // Author Mapping Logic
    if (article.author_id && typeof article.author_id === 'object' && article.author_id.name) {
        authorName = article.author_id.name;
    }

    // Category Mapping Logic 
    let categories = [];
    if (Array.isArray(article.subcategory_ids)) {
        categories = article.subcategory_ids
            .map(subcat => {
                // subcat is now the full populated object
                if (subcat && subcat.name && subcat.slug) {
                    return {
                        name: subcat.name,
                        link: `/category/${subcat.slug}`
                    };
                }
                return null;
            })
            .filter(cat => cat !== null)
            .slice(0, 2);
    }

    if (categories.length === 0) {
        categories.push({ name: 'GENERAL', link: '/category/general' });
    }

    return {
        id: article._id.toString(),
        is_featured: article.permissions?.is_featured || false,
        titleMalayalam: article.title || 'Untitled Article',
        slug: article.slug,
        descriptionMalayalam: article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available.'),
        imageSrc: article.featured_image || 'https://placehold.co/1200x675/ccc/333?text=Image+Missing',
        categories: categories,
        author: authorName,
        date: formatDate(dateString),
        timestamp: new Date(dateString).getTime(),
    };
};