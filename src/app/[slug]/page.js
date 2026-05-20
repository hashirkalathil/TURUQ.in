// src/app/[slug]/page.js

export const dynamic = 'force-dynamic';

import Tag from "@/components/ui/tag";
import { getArticle } from "@/lib/mongodb";
import { notFound } from "next/navigation";
import Link from "next/link";
import ViewCounter from "@/components/article/ViewCounter";
import ShareButton from "@/components/article/ShareButton";
import Image from "next/image";

const decodeHtml = (str) => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
};

const extractFootnotes = (html) => {
  if (!html) return { processedHtml: "", footnotes: [] };

  const footnotes = [];
  let index = 1;

  // Match any span with class footnote-ref-marker
  const spanRegex = /<span\s+([^>]*class="[^"]*footnote-ref-marker[^"]*"[^>]*)>([\s\S]*?)<\/span>/gi;

  const processedHtml = html.replace(spanRegex, (fullMatch, attributes) => {
    // Extract data-note from attributes
    const noteMatch = attributes.match(/data-note="([^"]*)"/i) || attributes.match(/data-note='([^']*)'/i);
    const noteText = noteMatch ? decodeHtml(noteMatch[1]) : "";

    footnotes.push({
      id: index,
      text: noteText,
    });

    const replacement = `<sup id="fnref:${index}" class="footnote-sup"><a href="#fn:${index}" class="footnote-ref-link">${index}</a></sup>`;
    index++;
    return replacement;
  });

  return { processedHtml, footnotes };
};

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
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image || "https://placehold.co/1200x630"],
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      authors: article.author_id?.name ? [article.author_id.name, ...(article.additional_author_ids?.map(a => a.name) || [])].filter(Boolean) : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featured_image || "https://placehold.co/1200x630"],
    }
  };
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const article = await getArticle(slug);

  if (!article) notFound();

  const primaryAuthor = article.author_id && article.author_id.name
    ? article.author_id
    : {
      name: "Unknown Author",
      biography: "Biography not available.",
      avatar: null,
      _id: null,
    };

  const additionalAuthors = Array.isArray(article.additional_author_ids) 
    ? article.additional_author_ids.filter(a => a && a.name)
    : [];

  const allAuthors = [primaryAuthor, ...additionalAuthors];

  const { processedHtml, footnotes } = extractFootnotes(article.content);
  const readTime = calculateReadTime(article.content);
  const categories = getDisplayCategories(article);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://turuq.in";
  const shareUrl = `${siteUrl}/${article.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    image: article.featured_image ? [article.featured_image] : [],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: allAuthors.map(author => ({
      '@type': 'Person',
      name: author.name,
      url: author._id ? `${siteUrl}/author/${author._id}` : undefined
    })),
    publisher: {
      '@type': 'Organization',
      name: 'TURUQ',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon1.png`
      }
    },
    description: article.excerpt
  };

  return (
    <main className="mt-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Client Component: View Counter (Invisible) */}
      <ViewCounter slug={slug} />

      {/* FEATURED IMAGE */}
      <section className="flex flex-col items-center max-w-[1250px] w-full mx-auto border border-black rounded-[20px] p-2 md:p-5 lg:p-8 mb-10 overflow-hidden bg-[#ffedd9] shadow-sm">
        <div className="relative w-full h-[300px] md:h-[540px] rounded-[20px] overflow-hidden bg-gray-100">
          <Image
            src={article.featured_image || "https://placehold.co/1200x540"}
            alt={article.title || "Featured article image"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </section>

      <div className="max-w-[1250px] mx-auto flex flex-col lg:flex-row-reverse items-start justify-between gap-10 px-1">
        {/* LEFT: AUTHOR + SHARE */}
        <aside className="flex flex-col shrink-0 items-center gap-6 w-full lg:w-[300px] order-2 lg:order-2">
          {allAuthors.map((author, index) => (
            <div key={author._id || index} className="w-full border border-black rounded-3xl p-6 text-center bg-[#ffedd9] transition-shadow font-poppins">
              <div className="text-xs font-bold tracking-wider mb-4 text-black/50 uppercase">
                Author
              </div>

              <div className="relative inline-block mb-4">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name || "Author"}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border border-black shadow-sm bg-white"
                    unoptimized
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border border-black shadow-sm bg-gray-50 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <h3 className="font-bold local-font-rachana text-lg lg:text-xl mb-2 text-black">
                {author.name}
              </h3>

              <p className="text-sm local-font-rachana text-black/70 leading-relaxed mb-5 px-2 line-clamp-3">
                {author.biography}
              </p>

              {author._id ? (
                <Link
                  href={`/author/${author._id}`}
                  className="block w-full px-6 py-3 border border-black text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 uppercase text-sm font-bold tracking-wide shadow-sm hover:shadow-md text-center"
                >
                  Visit Profile
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full px-6 py-3 border border-black/10 text-black/30 rounded-xl uppercase text-sm font-bold tracking-wide cursor-not-allowed"
                >
                  Profile Unavailable
                </button>
              )}
            </div>
          ))}

          {article.translator && (
            <div className="w-full border border-black rounded-3xl p-4 text-center bg-[#ffedd9] transition-shadow font-poppins">
              {/* <div className="text-xs font-bold tracking-wider mb-4 text-black/50 uppercase">
                വിവർത്തനം
              </div> */}

              <h3 className="font-bold local-font-rachana text-lg lg:text-xl text-black">
                വിവ: {article.translator}
              </h3>
            </div>
          )}

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

            <div className="flex gap-4 text-xs md:text-sm text-black/50 font-poppins font-medium">
              <span>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span>•</span>
              <span>{readTime} Min Read</span>
              {/* <span>•</span> */}
              <span>{article.views || 0} Views</span>
            </div>
          </div>

          <h1 className="local-font-rachana font-extrabold text-3xl md:text-[50px] md:leading-[1.1] text-red-600 mb-6 md:mb-8">
              {article.title}
          </h1>

          {article.excerpt && (
            <p className="local-font-rachana text-xl md:text-2xl text-black/70 italic mb-8 leading-relaxed border-l-4 border-red-600/30 pl-4">
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content local-font-rachana prose prose-lg prose-red max-w-none text-black/90 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          {footnotes.length > 0 && (
            <section className="mt-16 pt-8 border-t border-dashed border-black/10">
              <h2 className="text-xl font-bold text-red-600 mb-6 flex items-center gap-2 font-poppins tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-600">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                  <path d="M6 6h10"/>
                  <path d="M6 10h10"/>
                </svg>
                REFERENCES & FOOTNOTES
              </h2>
              <ol className="space-y-3">
                {footnotes.map((fn) => (
                  <li 
                    key={fn.id} 
                    id={`fn:${fn.id}`} 
                    className="footnote-item flex items-start gap-3 m-0 rounded-xl hover:bg-[#ffedd9]/30 transition-all duration-200 target:bg-[#ffedd9]/20 target:ring-red-200/50 scroll-mt-24"
                  >
                    <span className="font-bold text-black/60 text-sm md:text-base select-none">{fn.id}.</span>
                    <div className="flex-1 text-black/70 text-sm md:text-base leading-relaxed local-font-rachana">
                      {fn.text}
                      <a 
                        href={`#fnref:${fn.id}`} 
                        className="ml-2 text-red-600 hover:text-red-800 transition-colors font-bold inline-block"
                        title="Back to text"
                      >
                        ↩
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>
      </div>

      <div className="max-w-[1250px] mx-auto w-full h-px bg-black/10 my-14" />

    </main>
  );
}