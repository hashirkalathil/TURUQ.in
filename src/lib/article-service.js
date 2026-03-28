// src/lib/article-service.js
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import Webzine from "@/models/Webzine";
import "@/models/Author";
import "@/models/SubCategory";
import "@/models/Category";

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return 'Unknown Date';
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formattedMonth = monthNames[dateObj.getMonth()];
  return `${day} ${formattedMonth} ${year}`.toUpperCase();
};

const mapArticleData = (article) => {
  const rawDate = article.created_at || article.created_at?.$date;
  const dateString = rawDate ? rawDate : new Date();

  let authorName = 'Anonymous Writer';
  if (article.author_id && article.author_id.name) {
    authorName = article.author_id.name;
  }

  let categories = [];

  const subIds = article.subcategory_ids || [];
  const catIds = article.category_ids || [];

  if (subIds.length > 0) {
    // Priority 1: Subcategories
    categories = subIds
      .filter(s => s && s.name && s.slug)
      .map(s => ({
        name: s.name,
        link: `/category/${s.parent_id?.slug || 'general'}/${s.slug}`
      }))
      .slice(0, 2);
  } else if (catIds.length > 0) {
    categories = catIds
      .filter(c => c && c.name && c.slug)
      .map(c => ({
        name: c.name,
        link: `/category/${c.slug}`
      }))
      .slice(0, 1);
  }

  // Priority 3: Fallback
  if (categories.length === 0) {
    categories.push({ name: 'GENERAL', link: '/category/general' });
  }

  return {
    id: article._id.toString(),
    is_featured: article.permissions?.is_featured || false,
    is_slide: article.permissions?.is_slide_article || false,
    views: article.views || 0,
    title: article.title || 'Untitled Article',
    slug: article.slug,
    description: article.excerpt || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available.'),
    imageSrc: article.featured_image || 'https://placehold.co/1200x675/ccc/333?text=Image+Missing',
    categories: categories,
    author: authorName,
    date: formatDate(dateString),
    timestamp: new Date(dateString).getTime(),
  };
};

export async function getHomeData() {
  try {
    await dbConnect();

    const posts = await Post.find({ status: 'published' })
      .sort({ created_at: -1 })
      .populate('author_id')
      .populate('category_ids')
      .populate({
        path: 'subcategory_ids',
        populate: {
          path: 'parent_id',
          model: 'Category',
          select: 'slug'
        }
      })
      .lean()
      .exec();

    const allMappedArticles = posts.map(article => mapArticleData(article));

    const heroArticles = allMappedArticles
      .filter(a => a.is_slide)
      .slice(0, 5);

    const featuredArticles = allMappedArticles
      .filter(a => a.is_featured)
      .slice(0, 4);

    const popularArticles = [...allMappedArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);

    const mostRecentArticles = allMappedArticles.slice(0, 12);

    // Fetch archived webzines for the ArchiveSection
    const latestWebzine = await Webzine.findOne({ status: 'published' })
      .sort({ published_at: -1 })
      .select('_id')
      .lean();

    const archivedWebzines = await Webzine.find({
      status: 'published',
      ...(latestWebzine && { _id: { $ne: latestWebzine._id } })
    })
      .sort({ published_at: -1 })
      .limit(3)
      .lean();

    return { 
      heroArticles, 
      featuredArticles, 
      mostRecentArticles, 
      popularArticles, 
      archivedWebzines: archivedWebzines.map(w => ({
        id: w._id.toString(),
        name: w.name,
        slug: w.slug,
        cover_image: w.cover_image
      }))
    };

  } catch (error) {
    console.error("Service Error in getHomeData:", error);
    return { heroArticles: [], featuredArticles: [], mostRecentArticles: [], popularArticles: [], archivedWebzines: [] };
  }
}

export async function getAuthorDetails(identifier) {
  try {
    await dbConnect();
    const Author = (await import("@/models/Author")).default;

    // Try to find author by ID or Slug
    let author = null;
    if (!identifier) return null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      author = await Author.findById(identifier).lean();
    }

    if (!author) {
      author = await Author.findOne({ slug: identifier }).lean();
    }

    if (!author) return null;

    // Fetch posts by this author
    const posts = await Post.find({ author_id: author._id, status: 'published' })
      .sort({ created_at: -1 })
      .populate('author_id') // Populate to ensure mapArticleData works (even though we know the author)
      .populate('category_ids')
      .populate({
        path: 'subcategory_ids',
        populate: {
          path: 'parent_id',
          model: 'Category',
          select: 'slug'
        }
      })
      .lean()
      .exec();

    const articles = posts.map(mapArticleData);

    return {
      author: {
        name: author.name,
        slug: author.slug,
        biography: author.biography,
        avatar: author.avatar || "https://placehold.co/150x150/ccc/333?text=User",
        email: author.email
      },
      articles
    };

  } catch (error) {
    console.error("Service Error in getAuthorDetails:", error);
    return null;
  }
}