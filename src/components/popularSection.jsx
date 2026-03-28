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
        <div className="mx-auto flex flex-col w-[83%] max-w-[1250px] gap-2 sm:gap-4 md:gap-8">
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
                        key={article.id || index} // Prefer ID, fallback to index
                        className="w-full flex flex-row items-center gap-2 sm:gap-6 lg:gap-10 border border-black rounded-xl p-2 md:p-4 hover:shadow-lg transition-all duration-300 bg-transparent group"
                        data-aos="fade-up"
                        data-aos-delay={(index + 1) * 100}
                    >
                        {/* --- 1. Date & Author Section (Left) --- */}
                        <div className="hidden lg:flex flex-col items-center justify-center text-center w-full md:w-[15%] shrink-0 gap-1">
                            <span className="text-7xl font-bold font-oswald text-black leading-none tracking-tighter">
                                {day}
                            </span>
                            <span className="text-sm font-medium uppercase tracking-wider text-[#8c8c8c] font-poppins">
                                {month} {year}
                            </span>
                            <span className="text-base font-medium text-black mt-2 local-font-rachana">
                                {article.author}
                            </span>
                        </div>

                        {/* --- 2. Image Section (Middle) --- */}
                        <div className="w-[120px] md:w-[250px] h-[100px] md:h-[180px] shrink-0 overflow-hidden rounded-2xl bg-black">
                            <Image
                                loader={isCloudinary ? cloudinaryLoader : undefined}
                                src={src}
                                alt={article.title}
                                width={500}
                                height={300}
                                sizes="(max-width: 768px) 100vw, 350px"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* --- 3. Content Section (Right) --- */}
                        <div className="flex-1 flex flex-col justify-around h-fit w-full gap-1 sm:gap-2 md:gap-3 text-left">
                            <div className="flex flex-wrap gap-2 mb-1">
                                {(article.categories || []).map((cat, catIndex) => (
                                    <Tag
                                        key={catIndex}
                                        className="uppercase line-clamp-1"
                                        linkClassName="text-[8px]"
                                        link={cat.link} // Ensure Tag component receives the link prop if it supports it
                                    >
                                        {cat.name}
                                    </Tag>
                                ))}
                            </div>

                            <a href={`/${article.slug}`} className="block group/title">
                                <h3 className="article-title local-font-rachana text-lg md:text-2xl lg:text-3xl font-bold leading-tight text-[#993333] hover:text-red-800 transition-colors">
                                    {article.title}
                                </h3>
                            </a>

                            <p className="local-font-rachana text-black/80 mb-2 text-sm sm:text-base hidden md:block leading-5 line-clamp-1 md:line-clamp-3">
                                {article.description}
                            </p>

                            <div className="article-meta lg:hidden flex items-center gap-2 mt-auto">
                                <span className="author text-[10px] md:text-[12px] font-semibold text-black">{article.author}</span>
                                <span className="divider text-[10px] md:text-[12px] text-black">|</span>
                                <span className="date text-[10px] md:text-[12px] font-normal text-black opacity-45">{article.date}</span>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}