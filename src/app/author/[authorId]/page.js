
import Image from "next/image";
import { getAuthorDetails } from "@/lib/article-service";
import PopularArticles from "@/components/popularSection";
import SectionHeader from "@/components/reusable/SectionHeader";
import { notFound } from "next/navigation";

export default async function AuthorPage({ params }) {
    const { authorId } = await params;
    const data = await getAuthorDetails(authorId);

    if (!data) {
        return notFound();
    }

    const { author, articles } = data;

    return (
        <main className="min-h-screen bg-[#ffedd9] pt-10 pb-20">
            {/* Author Header */}
            <div className="container mx-auto px-4 mb-16">
                <div className="rounded-2xl p-8 max-w-4xl mx-auto flex flex-col items-center gap-8">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-red-50 shadow-inner relative">
                            <Image
                                src={author.avatar}
                                alt={author.name}
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1 space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-red-800 local-font-rachana">{author.name}</h1>
                        {author.biography && (
                            <p className="text-gray-600 leading-relaxed font-poppins max-w-2xl">{author.biography}</p>
                        )}
                        <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-500">
                            <span className="bg-red-50 px-3 py-1 mx-auto rounded-full text-red-600 font-medium">
                                {articles.length} Articles
                            </span>
                            {/* Could add email or other connect links here if desired */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Articles Section - Styled like Popular Section */}
            <section className="w-full">
                <SectionHeader>
                    Articles by   <span className="local-font-rachana font-bold">  {author.name}</span>
                </SectionHeader>

                <div className="mt-8">
                    <PopularArticles articles={articles} />
                </div>
            </section>
        </main>
    );
}
