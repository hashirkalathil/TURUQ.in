import dbConnect from "@/mongodb";
import Post from "@/models/Post";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://turuq.in';
  
  let markdown = `# TURUQ Webzine\n\n`;
  markdown += `TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society.\n\n`;
  
  markdown += `## Sections\n`;
  markdown += `- [Home](${baseUrl}/): Homepage of TURUQ Webzine\n`;
  markdown += `- [Featured](${baseUrl}/featured): Specially featured articles and essays\n`;
  markdown += `- [Recent](${baseUrl}/recent): The most recently published articles\n`;
  markdown += `- [Popular](${baseUrl}/popular): Trending and most-read articles\n`;
  markdown += `- [About Us](${baseUrl}/about): Information about the TURUQ platform\n\n`;
  
  try {
    await dbConnect();
    // Fetch all published posts
    const posts = await Post.find({ status: 'published' })
      .select('title slug excerpt created_at')
      .sort({ created_at: -1 })
      .lean()
      .exec();
      
    if (posts.length > 0) {
      markdown += `## Articles\n`;
      posts.forEach(post => {
        const excerpt = post.excerpt ? ` - ${post.excerpt.replace(/\n/g, ' ')}` : '';
        markdown += `- [${post.title}](${baseUrl}/${post.slug})${excerpt}\n`;
      });
    }
  } catch (error) {
    console.error("Error generating llms.txt:", error);
    markdown += `\n*Note: Temporarily unable to load full article index.*\n`;
  }
  
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
