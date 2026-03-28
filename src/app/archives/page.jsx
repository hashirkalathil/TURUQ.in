import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/mongodb";
import Webzine from "@/models/Webzine";
import Footer from "@/components/footer/footer";

export const metadata = {
    title: "Archives — TURUQ",
    description: "Browse all previous issues of TURUQ Webzine.",
};

async function getArchivedWebzines() {
    try {
        await dbConnect();

        const latestWebzine = await Webzine.findOne({ status: 'published' })
            .sort({ published_at: -1 })
            .select('_id')
            .lean();

        if (!latestWebzine) {
            return [];
        }

        const previousWebzines = await Webzine.find({
            status: 'published',
            _id: { $ne: latestWebzine._id }
        })
            .sort({ published_at: -1 })
            .lean();

        const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        }) : '';

        return previousWebzines.map(w => ({
            ...w,
            _id: w._id.toString(),
            published_date: formatDate(w.published_at)
        }));

    } catch (error) {
        console.error("Error fetching archived webzines:", error);
        return [];
    }
}

export default async function ArchivesPage() {
    const archives = await getArchivedWebzines();

    return (
        <div className="mt-10 min-h-screen flex flex-col justify-between bg-background">
            <main className="mb-20">
                {/* Page Header */}
                <div className="w-[83%] max-w-[1250px] mx-auto mb-10 text-left">
                    <h1 className="text-4xl font-bold text-[#a82a2a] local-font-rachana border-b border-black/20 pb-4">
                        Archives
                    </h1>
                </div>

                {/* ARCHIVE GRID SECTION */}
                <section className="w-[83%] max-w-[1250px] mx-auto pt-8">
                    {archives.length > 0 ? (
                        <div className="articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {archives.map((webzine) => (
                                <article
                                    key={webzine._id}
                                    className="article-card relative rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg bg-background flex flex-col"
                                >
                                    {/* Cover Image */}
                                    <div className="article-image mb-4 aspect-square w-full overflow-hidden rounded-xl">
                                        <Link href={`/archives/${webzine.slug}`}>
                                            <Image
                                                unoptimized={true}
                                                src={webzine.cover_image || 'https://placehold.co/400x300/ccc/333?text=Cover'}
                                                alt={webzine.name}
                                                width={400}
                                                height={300}
                                                className="h-full w-full object-cover transition-transform duration-500"
                                            />
                                        </Link>
                                    </div>

                                    {/* Content Wrapper */}
                                    <div className="flex flex-col flex-1 justify-between gap-3">
                                        <Link href={`/archives/${webzine.slug}`}>
                                            <h3 className="article-title local-font-rachana text-[25px] font-bold leading-tight py-1 text-[#a82a2a] hover:text-red-700 transition-colors line-clamp-2">
                                                {webzine.name}
                                            </h3>
                                        </Link>

                                        {/* Meta Section */}
                                        <div className="article-meta flex items-center gap-2 mt-auto border-t border-black/30 pt-3">
                                            <span className="date text-xs font-semibold text-black opacity-45 uppercase tracking-wider">
                                                {webzine.published_date}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-xl text-gray-500">No archived webzines found.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
