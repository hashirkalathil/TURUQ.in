// src/app/category/[slug]/[subCategoryName]/page.jsx

export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { getSubCategoryData } from "@/lib/category";
import Footer from "@/components/footer/footer";
import Tag from "@/components/ui/tag";
import CategoryArticles from "./CategoryArticles";
import styles from "../category.module.css";

// src/app/category/[slug]/[subCategoryName]/page.jsx

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug, subCategoryName } = resolvedParams;
  
  const { activeSubCategory, mainCategory } = await getSubCategoryData(slug, subCategoryName);

  if (!activeSubCategory || !mainCategory) return { title: "Category Not Found" };

  return {
    title: `${activeSubCategory.name} | ${mainCategory.name} - TURUQ`,
    description: `Articles in ${activeSubCategory.name}, under ${mainCategory.name}.`,
  };
}

export default async function SubCategoryPage({ params }) {
  const resolvedParams = await params;
  const { slug, subCategoryName } = resolvedParams;

  const { articles, activeSubCategory, mainCategory, subCats } = await getSubCategoryData(slug, subCategoryName);

  if (!activeSubCategory || !mainCategory) {
    notFound();
  }

  const filterLinks = [
    { label: `All ${mainCategory.name}`, slug: slug, isMain: true },
    ...subCats.map((s) => ({ label: s.name, slug: s.slug, isMain: false })),
  ];

  return (
    <div className="mt-10">
      <div className={styles.container}>
        
        {/* HEADER: Show Subcategory Name */}
        <section className={styles.categoryHeader}>
          <h1 className={styles.categoryTitle}>
            {activeSubCategory.name}
          </h1>
        </section>

        {/* FILTER NAVIGATION */}
        <nav className={styles.subCategoryContainer}>
          {filterLinks.map((l) => {
            const isActive = l.slug === subCategoryName || (l.isMain && !subCategoryName);
            return (
              <Tag
                key={l.slug}
                link={
                  l.isMain
                    ? `/category/${mainCategory.slug}`
                    : `/category/${mainCategory.slug}/${l.slug}`
                }
                className={isActive ? "bg-[#e7000b]! text-white!" : "bg-background"}
              >
                {l.label.toUpperCase()}
              </Tag>
            );
          })}
        </nav>

        <CategoryArticles articles={articles} />
      </div>
    </div>
  );
}