// src/app/featured/page.jsx
import { getFeaturedArticles } from "@/lib/article-service";
import CategoryArticleLayout from "@/components/reusable/CategoryArticleLayout";

export const dynamic = 'force-dynamic';

export default async function FeaturedArticlesPage() {
  const articles = await getFeaturedArticles();

  return (
    <CategoryArticleLayout 
      title="Featured Articles" 
      articles={articles} 
    />
  );
}
