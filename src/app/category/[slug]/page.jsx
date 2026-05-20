// src/app/category/[slug]/page.jsx

export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCategoryData } from "@/lib/category";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/models/Category";
import Tag from "@/components/ui/tag";
import styles from "./category.module.css";
import CategoryTag from "@/components/ui/CategoryTag";
import ArticleListWithLoadMore from "@/components/reusable/ArticleListWithLoadMore";

export async function generateStaticParams() {
  await dbConnect();
  const categories = await Category.find({}).select("slug").lean();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  await dbConnect();
  const mainCategory = await Category.findOne({ slug }).select('name').lean();
  
  if (!mainCategory) return { title: "Category Not Found" };
  return {
    title: `${mainCategory.name} - TURUQ`,
    description: `All articles under the ${mainCategory.name} category.`,
  };
}

export default async function DynamicCategoryPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { articles, subCats, mainCategory } = await getCategoryData(slug);

  if (!mainCategory) {
    notFound();
  }

  const currentCategoryName = mainCategory.name;

  const filterLinks = [
    { label: "All", slug: slug },
    ...subCats.map((s) => ({ label: s.name, slug: s.slug })),
  ];

  return (
    <div className="mt-10">
      <div className={styles.container}>
        {/* CATEGORY HEADER */}
        <section className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>{currentCategoryName}</h1>
        </section>

        {/* SUB-FILTER (SubCategories) */}
        {filterLinks.length > 1 && (
          <nav className={styles.subCategoryContainer}>
            {filterLinks.map((l) => {
              const isActive = (l.label === "All" && !resolvedParams.subCategoryName) || 
                               (resolvedParams.subCategoryName === l.slug);
              return (
                <CategoryTag
                  key={l.slug}
                  link={
                    l.label === "All"
                      ? `/category/${slug}`
                      : `/category/${slug}/${l.slug}`
                  }
                  className={isActive ? "!bg-red-600 !text-white" : "bg-background"}
                >
                  {l.label.toUpperCase()}
                </CategoryTag>
              );
            })}
          </nav>
        )}

        {/* ARTICLES GRID */}
        {/* ARTICLES GRID & LOAD MORE */}
        {articles.length > 0 ? (
          <ArticleListWithLoadMore 
            articles={articles} 
            styles={styles} 
          />
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h2
              style={{ fontFamily: "Rachana", fontSize: "24px", color: "rgba(0, 0, 0, 0.5)" }}
            >
              No articles found in this category yet.
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
