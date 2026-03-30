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
                <Tag
                  key={l.slug}
                  link={
                    l.label === "All"
                      ? `/category/${slug}`
                      : `/category/${slug}/${l.slug}`
                  }
                  className={isActive ? "bg-[#e7000b]! text-white!" : "bg-background"}
                >
                  {l.label.toUpperCase()}
                </Tag>
              );
            })}
          </nav>
        )}

        {/* ARTICLES GRID */}
        {articles.length > 0 ? (
          <div className={styles.articlesContainer}>
            {articles.map((a) => (
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

        {/* SEE MORE BUTTON - Placeholder logic */}
        {articles.length > 20 && (
          <div className={styles.seeMoreSection}>
            <button className={styles.seeMoreBtn}>SEE MORE</button>
          </div>
        )}
      </div>
    </div>
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