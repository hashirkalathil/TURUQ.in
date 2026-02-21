// src/components/MostRecentArticles.jsx
'use client';

import Image from "next/image";
import Tag from "./ui/tag";

export default function MostRecentArticles({ articles }) {

  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-medium text-gray-500">No articles found.</p>
      </div>
    );
  }

  // 1. Get the latest article first
  const mainArticle = articles[0];
  // 2. Only slice the next 4 (Max 5 articles total)
  const sideArticles = articles.slice(1, 5);

  return (
    // 3. Main wrapper: explicitly define 2 columns and 4 rows on large screens
    <div className="recent-side-articles mx-auto grid w-[83%] max-w-[1250px] grid-cols-1 lg:grid-cols-2 lg:grid-rows-4 gap-4 md:gap-5">

      {/* Main Article Block */}
      {mainArticle && (
        <article 
          // 4. Force to Column 1, span across all 4 rows
          className="side-article lg:col-start-1 lg:row-start-1 lg:row-span-4 flex flex-col gap-5 rounded-xl border border-black p-5 transition-all hover:-translate-y-1 hover:shadow-lg bg-transparent" 
          data-aos="fade-up"
        >
          {/* Main Image */}
          <div className="side-article-image w-full h-[250px] md:h-[400px] rounded-xl overflow-hidden">
            <Image
              unoptimized={true}
              src={mainArticle.imageSrc}
              alt={mainArticle.title}
              width={600}
              height={400}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-full w-full object-cover transition-transform hover:scale-102"
              style={{ width: '100%', height: '100%' }}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x675/ccc/333?text=Image+Load+Error'; }}
            />
          </div>

          <div className="w-full flex flex-col justify-start flex-1">
            <div className="flex gap-2 mb-2 flex-wrap">
              {mainArticle.categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>{cat.name}</Tag>
              ))}
            </div>

            <a href={`/${mainArticle.slug}`}>
              <h4 className="side-article-title local-font-rachana text-[24px] sm:text-[32px] md:text-[40px] font-bold leading-7 lg:leading-[1.1] text-[#a82a2a] mt-2 hover:text-red-700 transition-colors">
                {mainArticle.title}
              </h4>
            </a>

            {/* Removed the 'hidden' class here so the description shows up like the image */}
            <p className="side-article-description local-font-rachana text-[16px] md:text-[20px] leading-6 font-normal text-black my-3 line-clamp-3 md:line-clamp-none">
              {mainArticle.description}
            </p>

            <div className="article-meta flex items-center gap-2 mt-auto pt-4">
              <span className="author text-sm font-semibold text-black">{mainArticle.author}</span>
              <span className="divider text-sm text-black">|</span>
              <span className="date text-sm font-normal text-black opacity-45">{mainArticle.date}</span>
            </div>
          </div>
        </article>
      )}

      {/* Side Articles Block - Removed the wrapper div so these are direct grid children */}
      {sideArticles.map((article, index) => (
        <article
          key={article.id}
          // Force into Column 2
          className="side-article lg:col-start-2 flex flex-row items-center gap-3 sm:gap-5 rounded-xl border border-black p-3 md:p-4 transition-all hover:-translate-y-1 hover:shadow-lg bg-transparent"
          data-aos="fade-up"
          data-aos-delay={(index + 1) * 100}
        >
          <div className="side-article-image w-[120px] md:w-[180px] h-[90px] md:h-[130px] shrink-0 rounded-xl overflow-hidden">
            <Image
              unoptimized={true}
              src={article.imageSrc}
              alt={article.title}
              width={180}
              height={180}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/300x300/ccc/333?text=Image+Load+Error";
              }}
            />
          </div>

          {/* Content Container */}
          <div className="side-article-content w-full h-full flex flex-col justify-center gap-1 md:gap-2">
            <div className="flex gap-2 flex-wrap">
              {article.categories.map((cat, catIndex) => (
                <Tag key={catIndex} link={cat.link}>
                  {cat.name}
                </Tag>
              ))}
            </div>

            <a href={`/${article.slug}`}>
              <h4 className="side-article-title local-font-rachana text-lg md:text-xl lg:text-2xl font-bold leading-tight text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-2">
                {article.title}
              </h4>
            </a>
            <div className="article-meta flex items-center gap-2 mt-1">
              <span className="author text-[10px] md:text-[12px] font-semibold text-black">
                {article.author}
              </span>
              <span className="divider text-[10px] md:text-[12px] text-black">|</span>
              <span className="date text-[10px] md:text-[12px] font-normal text-black opacity-45">
                {article.date}
              </span>
            </div>
          </div>
        </article>
      ))}

    </div>
  );
}