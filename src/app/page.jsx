// src/app/page.js

import MostRecentArticles from '@/components/MostRecentArticles';
import SectionHeader from '@/components/reusable/SectionHeader';
import ArchiveSection from '@/components/ArchiveSection';
import FeaturedArticles from '@/components/FeaturedArticles';
import HeroSection from '@/components/HeroSection';
import { getHomeData } from '@/lib/article-service';
import PopularArticles from '@/components/popularSection';

export const dynamic = 'force-dynamic'; 

export default async function Home() {
  const { heroArticles, featuredArticles, mostRecentArticles, popularArticles, archivedWebzines } = await getHomeData();

  if (!featuredArticles.length && !mostRecentArticles.length && !heroArticles.length) {
    return (
      <main className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
           <p className="text-2xl text-red-600 mb-2">Unable to load articles.</p>
           <p className="text-gray-500">Please try refreshing the page.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-5 bg-background w-full">
      {/* Hero Section */}
      <div>
        <HeroSection articles={heroArticles} />
      </div>

      {/* Featured Articles Section */}
      <section className="mb-28 w-full">
        <SectionHeader> Featured Articles </SectionHeader>
        <FeaturedArticles articles={featuredArticles} /> 
      </section>

      {/* Archive Section */}
      <section className="flex justify-center py-10 lg:py-16">
        <ArchiveSection archives={archivedWebzines} />
      </section>

      {/* Most Recent Section */}
      <section className="most-recent mb-16 w-full">
        <SectionHeader> Most Recent </SectionHeader>
        <MostRecentArticles articles={mostRecentArticles} />
      </section>

      <section className="popular-articles mb-16 w-full">
        <SectionHeader > Popular Section </SectionHeader>
        <PopularArticles articles={popularArticles} />
      </section>
    </main>
  );
}