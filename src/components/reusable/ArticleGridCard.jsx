// src/components/reusable/ArticleGridCard.jsx

import Link from "next/link";
import Image from "next/image";
import Tag from "../ui/tag";

export default function ArticleGridCard({ article, onClose }) {
  const subName = article.subcategory?.name?.toUpperCase();
  const subLink = article.subcategory?.link;

  return (
    <div className="search-article-card rounded-2xl flex overflow-hidden bg-[#ffedd9] border border-gray-500 shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6">
      {/* Article Image */}
      <Link
        href={article.link || "#"}
        onClick={onClose}
        className="block relative"
      >
        <div className="w-full h-60 relative overflow-hidden rounded-2xl">
          <Image
            src={article.image}
            alt={article.title || "Article Image"}
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400/ccc/333?text=Image+Missing";
            }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="px-4 sm:px-6 max-h-[240px] flex-1 flex flex-col justify-between">
        <div className="flex items-center">
          {/* Render Tag only if name exists */}
          {subName && (
            <Tag link={subLink} className="z-50 relative">
              {subName}
            </Tag>
          )}
        </div>

        <div>
          <Link href={article.link || "#"} onClick={onClose}>
            <h3 className="local-font-rachana font-bold text-[30px] cursor-pointer leading-[32px] mb-1 text-red-600 hover:text-red-700 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          {/* Clean Content Preview */}
          <div className="local-font-rachana line-clamp-3 text-[20px] leading-[22px]">
            {article.content}
          </div>
        </div>

        <div className="text-sm pt-2 border-t border-gray-100 flex items-center gap-2">
          <span className="font-poppins font-semibold text-xs text-black">
            {article.author}
          </span>
          <span className="text-gray-400 font-semibold text-sm">|</span>
          <span className="text-xs font-semibold text-gray-500">
            {article.date}
          </span>
        </div>
      </div>
    </div>
  );
}
