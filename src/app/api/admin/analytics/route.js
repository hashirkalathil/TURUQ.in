// src/app/api/admin/analytics/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/mongodb";
import Post from "@/models/Post";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "super-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      });
    }

    const viewsAgg = await Post.aggregate([
      { $match: { status: "published", published_at: { $ne: null } } },
      {
        $group: {
          _id: {
            year:  { $year: "$published_at" },
            month: { $subtract: [{ $month: "$published_at" }, 1] },
          },
          totalViews: { $sum: "$views" },
          postCount:  { $sum: 1 },
        },
      },
    ]);

    const viewsByMonth = months.map((m) => {
      const match = viewsAgg.find(
        (a) => a._id.year === m.year && a._id.month === m.month
      );
      return {
        label:      m.label,
        totalViews: match?.totalViews ?? 0,
        postCount:  match?.postCount  ?? 0,
      };
    });

    // Overall totals
    const totalViewsAll = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const topPosts = await Post.find({ status: "published" })
      .select("title views")
      .sort({ views: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      data: {
        viewsByMonth,
        totalViews: totalViewsAll[0]?.total ?? 0,
        topPosts,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
