// src/app/category/[slug]/[subCategoryName]/CategoryArticles.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Tag from "@/components/ui/tag";
import styles from "../category.module.css";

export default function CategoryArticles({ articles }) {
  const [visibleCount, setVisibleCount] = useState(10);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <>
      {/* ARTICLES GRID */}
      {visibleArticles.length > 0 ? (
        <div className={styles.articlesContainer}>
          {visibleArticles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <h2
            style={{ fontFamily: "Rachana", fontSize: "24px", color: "gray" }}
          >
            No articles found in this category yet.
          </h2>
        </div>
      )}

      {/* SEE MORE BUTTON */}
      {visibleCount < articles.length && (
        <div className={styles.seeMoreSection}>
          <button className={styles.seeMoreBtn} onClick={handleShowMore}>
            SEE MORE
          </button>
        </div>
      )}
    </>
  );
}

function ArticleCard({ article: a }) {
  return (
    <article className={styles.articleCard}>
      {/* Image Container */}
      <div className={styles.articleImage}>
        <Image
          src={a.imageSrc}
          alt={a.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          priority={false}
        />
      </div>

      <div className={styles.cardContent}>
        {/* Tags */}
        <div className={styles.tags}>
          {a.categories.map((c, idx) => (
            <Tag key={`${c.name}-${idx}`} link={c.link}>
              {c.name}
            </Tag>
          ))}
        </div>

        <div>
          {/* Title */}
          <Link href={`/${a.slug}`} className={styles.articleTitle}>
            {a.title}
          </Link>

          <p className={styles.articleDescription}>{a.description}</p>
        </div>

        {/* Meta */}
        <div className={styles.articleMeta}>
          <span className={styles.author}>{a.author}</span>
          <span className={styles.divider}>|</span>
          <span className={styles.date}>{a.date}</span>
        </div>
      </div>
    </article>
  );
}