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
    <div className="recent-side-articles mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 w-[83%] max-w-[1250px]">

      {/* Main Article Block (Left Column) */}
      {mainArticle && (
        <div className="xl:col-span-7 flex w-full h-full">
          <article
            className="side-article w-full flex flex-col gap-5 rounded-xl border border-black p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white/20"
            data-aos="fade-up"
          >
            {/* Main Image - Aspect Ratio Responsive Layout */}
            <div className="side-article-image w-full aspect-[16/10] rounded-xl overflow-hidden relative">
              <Image
                unoptimized={true}
                src={mainArticle.imageSrc}
                alt={mainArticle.title}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform hover:scale-102 rounded-xl"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x750/ccc/333?text=Image+Load+Error'; }}
              />
            </div>

            {/* Content block */}
            <div className="w-full flex flex-col justify-between flex-1 gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {mainArticle.categories.map((cat, index) => (
                    <Tag key={index} link={cat.link}>{cat.name}</Tag>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 py-1">
                <a href={`/${mainArticle.slug}`}>
                  <h4
                    spellCheck="false"
                    className="side-article-title local-font-rachana text-[24px] sm:text-[32px] md:text-[36px] font-bold leading-[24px] md:leading-[30px] text-[#a82a2a] hover:text-red-700 transition-colors"
                  >
                    {mainArticle.title}
                  </h4>
                </a>

                <p
                  spellCheck="false"
                  className="side-article-description hidden md:block local-font-rachana text-[16px] md:text-[20px] leading-tight font-normal text-black line-clamp-3"
                >
                  {mainArticle.description}
                </p>
              </div>

              {/* Metadata block with separator */}
              <div className="article-meta flex items-center gap-2 pt-4 border-t border-black/10 mt-auto">
                <span className="author text-xs font-poppins font-semibold text-black">{mainArticle.author}</span>
                <span className="divider text-xs text-black">|</span>
                <span className="date text-xs font-normal text-black opacity-45">{mainArticle.date}</span>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Side Articles Block (Right Column) */}
      <div className="xl:col-span-5 flex flex-col gap-4 md:gap-5 w-full">
        {sideArticles.map((article, index) => (
          <article
            key={article.id}
            className="side-article flex flex-row items-center gap-3 sm:gap-5 rounded-xl border border-black p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white/20"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100}
          >
            {/* Small card image relative fill layout */}
            <div className="side-article-image w-[120px] md:w-[180px] h-[90px] md:h-[130px] shrink-0 rounded-xl overflow-hidden relative">
              <Image
                unoptimized={true}
                src={article.imageSrc}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 120px, 180px"
                className="object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/300x300/ccc/333?text=Image+Load+Error";
                }}
              />
            </div>

            {/* Content Container */}
            <div className="side-article-content w-full h-full flex flex-col justify-between gap-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2 flex-wrap">
                  {article.categories.map((cat, catIndex) => (
                    <Tag key={catIndex} link={cat.link}>
                      {cat.name}
                    </Tag>
                  ))}
                </div>

              </div>
              <a href={`/${article.slug}`}>
                <h4
                  spellCheck="false"
                  className="side-article-title local-font-rachana text-lg md:text-xl lg:text-2xl font-bold leading-[20px] md:leading-[30px] text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-2"
                >
                  {article.title}
                </h4>
              </a>

              <div className="article-meta flex items-center gap-0.5">
                <span className="author text-[10px] md:text-[12px] line-clamp-1 flex-1 font-semibold text-black">
                  {article.author}
                </span>
                <span className="divider text-[10px] md:text-[12px] text-black">|</span>
                <span className="date text-[10px] md:text-[12px] font-semibold w-[62px] md:w-[75px] line-clamp-1 text-black opacity-45">
                  {article.date}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}