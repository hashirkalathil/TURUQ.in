// src/app/popular/page.jsx
import { getPopularArticles } from "@/lib/article-service";
import CategoryArticleLayout from "@/components/reusable/CategoryArticleLayout";

export const dynamic = 'force-dynamic';

export default async function PopularArticlesPage() {
  const articles = await getPopularArticles();

  return (
    <CategoryArticleLayout 
      title="Popular Section" 
      articles={articles} 
    />
  );
}
