// src/components/reusable/CategoryArticleLayout.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/components/ui/tag';
import styles from './CategoryArticleLayout.module.css';
import ArticleListWithLoadMore from '@/components/reusable/ArticleListWithLoadMore';

const CategoryArticleLayout = ({ title, articles }) => {
  return (
    <div className="mt-10">
      <div className={styles.container}>
        {/* HEADER */}
        <section className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>{title}</h1>
        </section>

        {/* ARTICLES GRID & LOAD MORE */}
        {articles.length > 0 ? (
          <ArticleListWithLoadMore 
            articles={articles} 
            styles={styles} 
          />
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


export default CategoryArticleLayout;
