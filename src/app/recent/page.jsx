// src/app/recent/page.jsx
import { getRecentArticles } from "@/lib/article-service";
import CategoryArticleLayout from "@/components/reusable/CategoryArticleLayout";

export const dynamic = 'force-dynamic';

export default async function RecentArticlesPage() {
  const articles = await getRecentArticles();

  return (
    <CategoryArticleLayout 
      title="Most Recent" 
      articles={articles} 
    />
  );
}
