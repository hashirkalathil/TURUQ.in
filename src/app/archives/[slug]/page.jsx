import WebzineDetail from "@/components/webzine/WebzineDetail";
import dbConnect from "@/mongodb";
import Webzine from "@/models/Webzine";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await dbConnect();
  const webzine = await Webzine.findOne({ slug, status: 'published' }).select('name description').lean();

  if (!webzine) {
    return { title: 'Issue Not Found | TURUQ' };
  }

  return {
    title: `${webzine.name} | TURUQ Webzine`,
    description: webzine.description,
  };
}

export default async function ArchiveIssuePage({ params }) {
  const { slug } = await params;
  return <WebzineDetail slug={slug} />;
}
