// src/components/popularSection.jsx
"use client";

import Image from "next/image";
import Tag from "./ui/tag";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export default function PopularArticles({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-xl font-medium text-gray-500">
          No popular articles found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col w-[83%] max-w-[1250px] gap-4 sm:gap-6 lg:gap-8">
      {articles.map((article, index) => {
        // Safe check for image source
        const rawSrc = article?.imageSrc;
        const hasValidImage = typeof rawSrc === "string" && rawSrc.trim().length > 0;

        const src = hasValidImage
          ? rawSrc
          : "https://placehold.co/400x250/ccc/333?text=Image+Missing";

        // Check for Cloudinary domain
        const isCloudinary = src.includes("cloudinary.com");

        // Safe Date Splitting (Fallbacks added)
        const dateParts = (article.date || "").split(" ");
        const day = dateParts[0] || "";
        const month = dateParts[1] || "";
        const year = dateParts[2] || "";

        return (
          <article
            key={article.id || index}
            className="w-full flex flex-row items-center gap-2.5 sm:gap-6 lg:gap-10 border border-black rounded-xl p-2.5 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300 bg-white/20 hover:-translate-y-0.5 group"
            data-aos="fade-up"
            data-aos-delay={(index + 1) * 100}
          >
            {/* --- 1. Date & Author Section (Left Column) --- */}
            <div className="hidden lg:flex flex-col items-center justify-center text-center w-[15%] shrink-0 border-r border-black/10 pr-6 lg:pr-8 py-2 gap-1.5">
              <span className="text-6xl font-bold font-oswald text-black leading-none tracking-tighter">
                {day}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-black/40 font-poppins">
                {month} {year}
              </span>
              <span spellCheck="false" className="text-sm font-semibold text-black/80 mt-2 local-font-rachana max-w-[120px] truncate">
                {article.author}
              </span>
            </div>

            {/* --- 2. Image Section (Middle) --- */}
            <div className="w-[100px] sm:w-[220px] lg:w-[260px] aspect-[4/3] sm:aspect-[16/10] shrink-0 overflow-hidden rounded-xl bg-black/5 relative shadow-sm">
              <Image
                loader={isCloudinary ? cloudinaryLoader : undefined}
                src={src}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100px, 260px"
                className="object-cover transition-transform duration-500 group-hover:scale-103 rounded-xl"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/400x250/ccc/333?text=Image+Missing";
                }}
              />
            </div>

            {/* --- 3. Content Section (Right Column) --- */}
            <div className="flex-1 min-w-0 h-full flex flex-col justify-between self-stretch gap-2 text-left pl-1 sm:pl-4">
              <div className="flex h-full md:justify-between flex-col gap-1.5 w-full">
                <div className="flex flex-wrap gap-1.5">
                  {(article.categories || []).map((cat, catIndex) => (
                    <Tag
                      key={catIndex}
                      className="uppercase line-clamp-1"
                      linkClassName="text-[8px]"
                      link={cat.link}
                    >
                      {cat.name}
                    </Tag>
                  ))}
                </div>

                <a href={`/${article.slug}`} className="block group/title w-full">
                  <h3
                    spellCheck="false"
                    className="article-title local-font-rachana line-clamp-2 w-full text-base sm:text-xl lg:text-[30px] font-bold leading-tight text-[#993333] hover:text-red-800 transition-colors break-words"
                  >
                    {article.title}
                  </h3>
                </a>

                <p
                  spellCheck="false"
                  className="local-font-rachana text-black/75 text-sm sm:text-base hidden md:line-clamp-2 w-full leading-tight mt-1"
                >
                  {article.description}
                </p>
              </div>

              {/* Mobile/Tablet Metadata Line */}
              <div className="article-meta lg:hidden flex w-full items-center gap-2 mt-auto border-t border-black/5 pt-1.5">
                <span className="author text-[10px] md:text-[12px] font-semibold text-black truncate">{article.author}</span>
                <span className="divider text-[10px] md:text-[12px] text-black">|</span>
                <span className="date text-[10px] md:text-[12px] font-normal text-black opacity-45 whitespace-nowrap">{article.date}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}