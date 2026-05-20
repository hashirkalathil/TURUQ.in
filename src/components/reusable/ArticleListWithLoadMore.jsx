"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/components/ui/tag';

function ArticleCard({ article: a, styles }) {
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

        <div className={styles.articleTextContainer}>
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

export default function ArticleListWithLoadMore({ articles, styles }) {
  const [visibleCount, setVisibleCount] = useState(10);

  // Chunk the articles array into groups of 10
  const chunks = [];
  for (let i = 0; i < Math.min(articles.length, visibleCount); i += 10) {
    chunks.push(articles.slice(i, i + 10));
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <>
      {chunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex} className={styles.articlesContainer}>
          {chunk.map((a) => (
            <ArticleCard key={a.id} article={a} styles={styles} />
          ))}
        </div>
      ))}
      
      {visibleCount < articles.length && (
        <div className={styles.seeMoreSection}>
          <button className={styles.seeMoreBtn} onClick={handleLoadMore}>
            SEE MORE
          </button>
        </div>
      )}
    </>
  );
}
