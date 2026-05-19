// src/components/reusable/CategoryArticleLayout.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/components/ui/tag';
import styles from './CategoryArticleLayout.module.css';

const CategoryArticleLayout = ({ title, articles }) => {
  return (
    <div className="mt-10">
      <div className={styles.container}>
        {/* HEADER */}
        <section className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>{title}</h1>
        </section>

        {/* ARTICLES GRID */}
        {articles.length > 0 ? (
          <div className={styles.articlesContainer}>
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h2 style={{ fontFamily: "Rachana", fontSize: "24px", color: "gray" }}>
              No articles found in this section yet.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

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

export default CategoryArticleLayout;
