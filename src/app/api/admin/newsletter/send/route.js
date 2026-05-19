import { dbConnect } from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { Resend } from 'resend';
import NewsletterEmail from "@/emails/NewsletterEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    await dbConnect();
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await Post.findById(postId).populate('author_id').lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const subscribers = await Subscriber.find({ status: 'active' }).select('email').lean();
    
    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
    }

    const emails = subscribers.map(s => s.email);
    const domain = process.env.NEXT_PUBLIC_BASE_URL || 'https://turuq.in';

    const { data, error } = await resend.emails.send({
      from: 'TURUQ Webzine <newsletter@turuq.in>',
      to: emails,
      subject: `New Article: ${post.title}`,
      react: NewsletterEmail({
        postTitle: post.title,
        postDescription: post.excerpt,
        postImage: post.featured_image,
        postLink: `${domain}/${post.slug}`,
        unsubscribeLink: `${domain}/unsubscribe?email=${encodeURIComponent('{{RECIPIENT_EMAIL}}')}`
      }),
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: `Newsletter sent successfully to ${subscribers.length} subscribers!`,
      id: data.id
    });
  } catch (error) {
    console.error("Newsletter Broadcast Error:", error);
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 });
  }
}
