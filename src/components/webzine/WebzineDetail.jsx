import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/mongodb";
import Webzine from "@/models/Webzine";
import Post from "@/models/Post";
import Tag from "../ui/tag";
import { BookOpen } from "lucide-react";
import ArchiveSection from "../ArchiveSection";

import "@/models/Author";
import "@/models/Category";
import "@/models/SubCategory";

async function getWebzineData(slug) {
  try {
    await dbConnect();

    let targetWebzine;
    if (slug) {
      targetWebzine = await Webzine.findOne({ slug, status: 'published' }).lean();
    } else {
      targetWebzine = await Webzine.findOne({ status: 'published' })
        .sort({ published_at: -1 })
        .lean();
    }

    if (!targetWebzine) {
      return { targetWebzine: null, posts: [], previousWebzines: [] };
    }

    const posts = await Post.find({
      webzine_id: targetWebzine._id,
      status: 'published'
    })
      .populate('author_id', 'name slug avatar')
      .populate('category_ids', 'name slug')
      .populate({
        path: 'subcategory_ids',
        populate: {
          path: 'parent_id',
          model: 'Category',
          select: 'slug'
        }
      })
      .sort({ created_at: -1 })
      .lean();

    const previousWebzines = await Webzine.find({
      status: 'published',
      _id: { $ne: targetWebzine._id }
    })
      .sort({ published_at: -1 })
      .lean();

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    const formatArticleDate = (dateString) => {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return 'Unknown Date';
      const day = String(dateObj.getDate()).padStart(2, '0');
      const year = dateObj.getFullYear();
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const formattedMonth = monthNames[dateObj.getMonth()];
      return `${day} ${formattedMonth} ${year}`.toUpperCase();
    };

    const formattedPosts = posts.map(p => {
      let categories = [];
      const subIds = p.subcategory_ids || [];
      const catIds = p.category_ids || [];

      if (subIds.length > 0) {
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
      
      if (categories.length === 0) {
        categories.push({ name: 'GENERAL', link: '/category/general' });
      }

      return {
        ...p,
        _id: p._id.toString(),
        created_at: p.created_at.toString(),
        displayDate: formatArticleDate(p.created_at),
        categories: categories
      };
    });

    return {
      targetWebzine: { ...targetWebzine, _id: targetWebzine._id.toString(), published_date: formatDate(targetWebzine.published_at) },
      posts: formattedPosts,
      previousWebzines: previousWebzines.map(w => ({ ...w, _id: w._id.toString(), published_date: formatDate(w.published_at) }))
    };

  } catch (error) {
    console.error("Error fetching webzine data:", error);
    return { targetWebzine: null, posts: [], previousWebzines: [] };
  }
}

export default async function WebzineDetail({ slug = null }) {
  const { targetWebzine, posts, previousWebzines } = await getWebzineData(slug);

  if (!targetWebzine) {
    return (
      <div className="mt-20 py-20 text-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Webzine Not Found</h1>
        <p className="text-gray-500 mb-8">The requested webzine issue could not be found.</p>
        <Link href="/archives" className="text-red-500 hover:underline font-bold">
          Back to Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen flex flex-col justify-between">
      <div className="mb-20">

        {/* Page Header */}
        <div className="w-[83%] max-w-[1250px] mx-auto mb-10">
          <h1 className="text-4xl font-bold text-[#a82a2a] local-font-rachana border-b border-black/20 pb-4">
            {slug ? "Archive Issue" : "Latest Issue"}
          </h1>
        </div>
        
        <section className="w-[83%] max-w-[1250px] mx-auto mb-32">

          {/* Hero / Webzine Info */}
          <div className="relative w-full aspect-2/5 md:aspect-4/1 min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden border-2 border-red-100 shadow-md mb-10 group bg-black">
            {/* Cover Image */}
            <Image
              unoptimized={true}
              src={targetWebzine.cover_image || 'https://placehold.co/1200x600/ccc/333?text=Cover'}
              alt={targetWebzine.name}
              fill
              priority={true}
              className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

            {/* Details - Absolute Positioned */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-3 md:space-y-5 z-10 transition-transform duration-500 transform translate-y-0">
              <div className="inline-block px-3 py-1 bg-background text-gray-800 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                {slug ? `Issue: ${targetWebzine.published_date}` : 'Latest Issue'}
              </div>
              
              <h2 className="text-3xl md:text-6xl font-bold text-white local-font-rachana drop-shadow-lg leading-tight uppercase">
                {targetWebzine.name}
              </h2>
              
              <p className="text-sm md:text-xl text-gray-200 leading-relaxed max-w-3xl line-clamp-2 md:line-clamp-3 font-medium drop-shadow-sm">
                {targetWebzine.description}
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-l-4 border-red-600 pl-4 py-1">
              <BookOpen className="w-6 h-6 text-red-600" />
              Articles in this Issue
            </h3>

            {posts.length > 0 ? (
              <div className="articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {posts.map((post) => (
                  <article
                    key={post._id}
                    className="article-card group relative rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg bg-background"
                  >
                    <div className="article-image mb-4 h-[200px] md:h-[250px] w-full overflow-hidden rounded-xl">
                      <Link href={`/${post.slug}`}>
                        <Image
                          unoptimized={true}
                          src={post.featured_image || 'https://placehold.co/400x250/ccc/333?text=Image+Missing'}
                          alt={post.title}
                          width={400}
                          height={250}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-90"
                        />
                      </Link>
                    </div>

                    <div className="flex h-auto md:h-[130px] flex-col justify-between gap-2 md:gap-0">
                      <div className="article-content flex h-auto flex-col">
                        <div className="flex gap-2">
                          {post.categories.map((cat, catIndex) => (
                            <Tag key={catIndex} link={cat.link}>
                              {cat.name}
                            </Tag>
                          ))}
                        </div>
                      </div>

                      <Link href={`/${post.slug}`}>
                        <h3 className="article-title local-font-rachana text-[25px] md:h-[55px] overflow-hidden font-bold leading-[27px] py-1 text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-2 my-2">
                          {post.title}
                        </h3>
                      </Link>

                      <div className="article-meta flex items-center gap-2">
                         <span className="author text-xs font-bold text-black capitalize">
                          {post.author_id?.name || 'Unknown Author'}
                        </span>{' '}
                        <span className="divider text-xs text-black">|</span>
                        <span className="date text-xs font-medium text-black opacity-45 uppercase">
                          {post.displayDate}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500">
                No articles have been added to this issue yet.
              </div>
            )}
          </div>

        </section>

        <ArchiveSection archives={previousWebzines} />
      </div>
    </div>
  );
}
