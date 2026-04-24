"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        addNotification("success", data.message);
        setEmail("");
      } else {
        addNotification("error", data.error);
      }
    } catch (error) {
      addNotification("error", "Failed to subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="my-20 w-full px-4 sm:px-0">
      <div className="mx-auto w-[90%] sm:w-[83%] max-w-[1250px] bg-background rounded-[40px] p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden relative border border-black shadow-xl group">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
           <Sparkles size={200} />
        </div>
        <div className="absolute bottom-0 left-0 p-10 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
           <Send size={150} />
        </div>

        <div className="relative z-10 space-y-4 max-w-xl text-center lg:text-left">
          <h2 className="text-3xl lg:text-5xl font-oswald font-bold text-black uppercase leading-tight">
            Never miss a story. <br/>
            <span className="text-red-600">Join our Newsletter.</span>
          </h2>
          <p className="text-lg lg:text-xl font-rachana text-black/90">
            Thoughtful discourse on culture, art, and society, delivered straight to your inbox.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 h-14 px-6 rounded-full border border-black bg-white text-black font-rachana text-lg focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-14 px-10 rounded-full bg-black text-white font-oswald font-bold hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-lg"
            >
              {loading ? "JOINING..." : "JOIN NOW"}
            </button>
          </form>
          <p className="mt-4 text-xs text-black/60 text-center lg:text-left font-poppins">
            By joining, you agree to our <Link href="/about" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
