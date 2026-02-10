import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/mongodb";
import Webzine from "@/models/Webzine";
import Post from "@/models/Post";
import Footer from "@/components/footer/footer";
import { User, Calendar, BookOpen } from "lucide-react";

async function getWebzineData() {
  try {
    await dbConnect();

    // 1. Fetch latest published webzine
    const latestWebzine = await Webzine.findOne({ status: 'published' })
      .sort({ published_at: -1 })
      .lean();

    if (!latestWebzine) {
      return { latestWebzine: null, posts: [], previousWebzines: [] };
    }

    // 2. Fetch posts for this webzine
    const posts = await Post.find({
      webzine_id: latestWebzine._id,
      status: 'published'
    })
      .populate('author_id', 'name slug avatar')
      .sort({ created_at: -1 })
      .lean();

    // 3. Fetch previous webzines (excluding the latest)
    const previousWebzines = await Webzine.find({
      status: 'published',
      _id: { $ne: latestWebzine._id }
    })
      .sort({ published_at: -1 })
      .lean();

    // Helper for date formatting
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    return {
      latestWebzine: { ...latestWebzine, _id: latestWebzine._id.toString(), published_date: formatDate(latestWebzine.published_at) },
      posts: posts.map(p => ({ ...p, _id: p._id.toString(), created_at: p.created_at.toString() })),
      previousWebzines: previousWebzines.map(w => ({ ...w, _id: w._id.toString(), published_date: formatDate(w.published_at) }))
    };

  } catch (error) {
    console.error("Error fetching webzine data:", error);
    return { latestWebzine: null, posts: [], previousWebzines: [] };
  }
}

export default async function WebzineComponent() {
  const { latestWebzine, posts, previousWebzines } = await getWebzineData();

  return (
    <div className="mt-10 min-h-screen flex flex-col justify-between">
      <main className="mb-20">

        {/* Page Header */}
        <div className="w-[83%] max-w-[1250px] mx-auto mb-10">
          <h1 className="text-4xl font-bold text-[#a82a2a] local-font-rachana border-b border-black/20 pb-4">
            Webzines
          </h1>
        </div>

        {/* --- LATEST ISSUE SECTION --- */}
        {latestWebzine ? (
          <section className="w-[83%] max-w-[1250px] mx-auto mb-16">

            {/* Hero / Latest Webzine Info */}
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 md:p-10 border border-red-100 shadow-sm mb-10">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Cover Image */}
                <div className="w-full md:w-1/3 aspect-[3/4] md:aspect-[4/5] relative rounded-xl overflow-hidden shadow-md">
                  <Image
                    unoptimized={true}
                    src={latestWebzine.cover_image || 'https://placehold.co/400x600/ccc/333?text=Cover'}
                    alt={latestWebzine.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    Latest Issue
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 local-font-rachana">
                    {latestWebzine.name}
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                    {latestWebzine.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 pt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Published: {latestWebzine.published_date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Grid for Latest Issue */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 border-l-4 border-red-600 pl-4 py-1">
                <BookOpen className="w-6 h-6 text-red-600" />
                Articles in this Issue
              </h3>

              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <article key={post._id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <div className="p-5 flex flex-col h-full">
                        {/* Category Badge (if any, though not populated in fetch) */}

                        <Link href={`/${post.slug}`}>
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2 local-font-rachana">
                            {post.title}
                          </h4>
                        </Link>

                        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                          {post.excerpt || "Click to read more..."}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                          <div className="flex items-center gap-2">
                            {post.author_id?.avatar ? (
                              <Image
                                unoptimized={true}
                                src={post.author_id.avatar}
                                alt={post.author_id.name}
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-700">
                              {post.author_id?.name || 'Unknown Author'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500">
                  No articles have been added to this issue yet.
                </div>
              )}
            </div>

          </section>
        ) : (
          <div className="w-[83%] max-w-[1250px] mx-auto py-20 text-center">
            <p className="text-xl text-gray-500">No webzines found.</p>
          </div>
        )}


        {/* --- PREVIOUS ISSUES / ARCHIVE SECTION --- */}
        {previousWebzines.length > 0 && (
          <section className="w-[83%] max-w-[1250px] mx-auto border-t border-gray-200 pt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              Previous Issues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {previousWebzines.map((webzine) => (
                <article
                  key={webzine._id}
                  className="group relative rounded-xl border border-gray-200 p-4 transition-all duration-300 hover:shadow-lg bg-white"
                >
                  <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 relative">
                    <Link href={`/webzine/${webzine.slug}`}>
                      <Image
                        unoptimized={true}
                        src={webzine.cover_image || 'https://placehold.co/400x300/ccc/333?text=Cover'}
                        alt={webzine.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>

                  <Link href={`/webzine/${webzine.slug}`}>
                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors capitalize mb-1 local-font-rachana">
                      {webzine.name}
                    </h4>
                  </Link>

                  <p className="text-xs text-gray-500 mb-2">
                    {webzine.published_date}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}