// src/app/[slug]/page.js

import Tag from "@/components/ui/tag";
import { getArticle } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import ViewCounter from "@/components/article/ViewCounter";
import ShareButton from "@/components/article/ShareButton";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return date
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
};

const calculateReadTime = (content) => {
  if (!content) return 0;
  const text = String(content).replace(/<[^>]+>/g, "");
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

const getDisplayCategories = (article) => {
  const subIds = article.subcategory_ids || [];
  const catIds = article.category_ids || [];

  if (Array.isArray(subIds) && subIds.length > 0) {
    return subIds
      .filter((s) => s && s.name)
      .map((s) => ({
        _id: s._id,
        name: s.name,
        link: `/category/${s.parent_id?.slug || "general"}/${s.slug}`,
      }));
  }

  if (Array.isArray(catIds) && catIds.length > 0) {
    return catIds
      .filter((c) => c && c.name)
      .map((c) => ({
        _id: c._id,
        name: c.name,
        link: `/category/${c.slug}`,
      }));
  }

  return [];
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const article = await getArticle(slug);

  if (!article) return { title: "Not found" };

  return {
    title: `${article.title} — TURUQ`,
    description: article.excerpt || article.title,
    openGraph: {
      images: [article.featured_image || "https://placehold.co/1200x630"],
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const article = await getArticle(slug);

  if (!article) notFound();

  const hasValidAuthor = article.author_id && article.author_id.name;

  const author = hasValidAuthor
    ? article.author_id
    : {
      name: "Unknown Author",
      biography: "Biography not available.",
      avatar: null,
      _id: null,
    };

  const readTime = calculateReadTime(article.content);
  const categories = getDisplayCategories(article);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://turuq.in";
  const shareUrl = `${siteUrl}/${article.slug}`;

  return (
    <main className="mt-8 px-4">
      {/* Client Component: View Counter (Invisible) */}
      <ViewCounter slug={slug} />

      {/* FEATURED IMAGE */}
      <section className="flex flex-col items-center max-w-[1250px] w-full mx-auto border border-black rounded-[20px] p-2 md:p-5 lg:p-8 mb-10 overflow-hidden bg-[#ffedd9] shadow-sm">
        <div className="relative w-full h-[300px] md:h-[540px] rounded-[20px] overflow-hidden bg-gray-100">
          {/* FIX: Replaced <Image> with standard <img> to bypass loader errors completely */}
          <img
            src={article.featured_image || "https://placehold.co/1200x540"}
            alt={article.title || "Featured article image"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row-reverse items-start justify-between gap-10 px-1">
        {/* LEFT: AUTHOR + SHARE */}
        <aside className="flex flex-col shrink-0 items-center gap-6 w-full lg:w-[300px] order-2 lg:order-2">
          <div className="w-full border border-black rounded-3xl p-6 text-center bg-[#ffedd9] transition-shadow font-poppins">
            <div className="text-xs font-bold tracking-wider mb-4 text-gray-500 uppercase">
              Author
            </div>

            <div className="relative inline-block mb-4">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name || "Author"}
                  className="w-20 h-20 rounded-full object-cover border border-black shadow-sm bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border border-black shadow-sm bg-gray-50 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="font-bold local-font-rachana text-lg lg:text-xl mb-2 text-gray-900">
              {author.name}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed mb-5 px-2 line-clamp-3">
              {author.biography}
            </p>

            {author._id ? (
              <Link
                href={`/author/${author._id}`}
                className="block w-full px-6 py-3 border-black text-red-700 rounded-xl border hover:bg-red-700 hover:text-white transition-all duration-200 uppercase text-sm font-bold tracking-wide shadow-sm hover:shadow-md text-center"
              >
                Visit Profile
              </Link>
            ) : (
              <button
                disabled
                className="w-full px-6 py-3 border-gray-300 text-gray-400 rounded-xl border-2 uppercase text-sm font-bold tracking-wide cursor-not-allowed"
              >
                Profile Unavailable
              </button>
            )}
          </div>

          {/* Client Component: Share Button */}
          <ShareButton
            title={article.title}
            text={article.excerpt || "Check out this article on TURUQ"}
            url={shareUrl}
          />
        </aside>

        {/* RIGHT: CONTENT */}
        <article className="w-full order-1 lg:order-1">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            {/* DYNAMIC CATEGORIES */}
            <div className="flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((cat, index) => (
                  <Tag key={cat._id || index} link={cat.link}>
                    {cat.name.toUpperCase()}
                  </Tag>
                ))
              ) : (
                <Tag link="#">UNCATEGORIZED</Tag>
              )}
            </div>

            <div className="flex gap-4 text-xs md:text-sm text-gray-500 font-medium">
              <span>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span>•</span>
              <span>{readTime} Min Read</span>
              {/* <span>•</span> */}
              <span>{article.views || 0} Views</span>
            </div>
          </div>

          <h1 className="local-font-rachana font-extrabold text-3xl md:text-[50px] md:leading-[1.1] text-red-800 mb-6 md:mb-8">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="font-serif text-xl md:text-2xl text-gray-600 italic mb-8 leading-relaxed border-l-4 border-red-200 pl-4">
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content local-font-rachana prose prose-lg prose-red max-w-none text-gray-800 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </div>

      <div className="max-w-[1250px] mx-auto w-full h-px bg-gray-200 my-14" />

    </main>
  );
}