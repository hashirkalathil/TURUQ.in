import dbConnect from "@/mongodb";
import Post from "@/models/Post";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://turuq.in';

  let articleUrls = [];

  try {
    await dbConnect();
    const posts = await Post.find({ status: 'published' }).select('slug updated_at created_at').lean().exec();

    articleUrls = posts.map((post) => ({
      url: `${baseUrl}/${post.slug}`,
      lastModified: post.updated_at || post.created_at || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/featured`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/recent`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/popular`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  return [...staticUrls, ...articleUrls];
}
