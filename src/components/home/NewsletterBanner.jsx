"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [subResult, setSubResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, whatsapp }),
      });

      const data = await res.json();

      if (res.ok) {
        addNotification("success", data.message);
        setSubResult(data.status);
        setEmail("");
        setName("");
        setWhatsapp("");
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
      <div className="mx-auto w-[90%] sm:w-[83%] max-w-[1250px] bg-background rounded-[40px] p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between md:gap-10 overflow-hidden relative border border-black shadow-xl group">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <Sparkles size={200} />
        </div>
        <div className="absolute bottom-0 left-0 p-10 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <Send size={150} />
        </div>

        <div className="relative z-10 space-y-4 max-w-xl text-center lg:text-left">
          <h2 className="text-3xl lg:text-5xl font-oswald font-bold text-black uppercase leading-tight">
            Never miss a story. <br />
            <span className="text-red-600">Join our Newsletter.</span>
          </h2>
          <p className="text-md lg:text-lg font-poppins text-black/75 font-normal">
            Thoughtful discourse on culture, art, and society, delivered straight to your inbox.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-md min-h-[280px] flex flex-col justify-center">
          {!subResult ? (
            <div className="transition-all duration-500 ease-in-out opacity-100 scale-100">
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full h-14 px-6 rounded-full border border-black bg-white text-black font-poppins text-sm md:text-base focus:outline-none placeholder:text-black/40 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200"
                  />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp No"
                    className="w-full h-14 px-6 rounded-full border border-black bg-white text-black font-poppins text-sm md:text-base focus:outline-none placeholder:text-black/40 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200"
                  />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full h-14 px-6 rounded-full border border-black bg-white text-black font-poppins text-sm md:text-base focus:outline-none placeholder:text-black/40 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 px-10 rounded-full bg-black text-white font-oswald font-bold hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap shadow-lg mt-1"
                >
                  {loading ? "JOINING..." : "JOIN NOW"}
                </button>
              </form>
              <p className="mt-4 text-xs text-black/60 text-center lg:text-left font-poppins">
                By joining, you agree to our <Link href="/about" className="underline hover:text-black">Privacy Policy</Link>.
              </p>
            </div>
          ) : (
            <div className="w-full text-center p-6 bg-white/20 backdrop-blur-md rounded-[30px] border border-black/10 shadow-lg transition-all duration-500 ease-in-out opacity-100 scale-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-600/10 border border-green-600 flex items-center justify-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="font-oswald font-bold text-2xl text-black uppercase tracking-wide">
                {subResult === "no_changes" ? "Already Subscribed" : subResult === "updated" ? "Details Updated" : "Welcome!"}
              </h3>

              <p className="text-sm md:text-base text-black font-semibold font-poppins leading-relaxed max-w-sm mx-auto">
                {subResult === "no_changes"
                  ? "You are already a subscriber. Now join our community if not already joined."
                  : "Success, you are now a subscriber. Join our community."}
              </p>

              <a
                href="https://chat.whatsapp.com/GfD8p9tLp098"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-oswald font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95 transition-all animate-pulse hover:animate-none"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328.001 11.894 0c3.181.001 6.171 1.242 8.42 3.496 2.249 2.254 3.487 5.247 3.485 8.43-.004 6.566-5.329 11.888-11.892 11.888-2.001-.001-3.971-.51-5.713-1.478L0 24zm6.59-4.846c1.66.986 3.284 1.489 4.908 1.49 5.25-.002 9.52-4.272 9.522-9.524.001-2.544-.989-4.936-2.788-6.737C16.488 2.58 14.1 1.588 11.89 1.587c-5.253 0-9.525 4.272-9.528 9.525-.001 1.785.525 3.518 1.521 5.06l-.993 3.626 3.767-.988zM16.45 13.48c-.247-.125-1.47-.726-1.696-.807-.228-.083-.393-.125-.558.125-.165.25-.638.806-.783.972-.145.166-.29.187-.538.062-2.316-1.157-3.411-2.007-4.887-4.542-.26-.447.26-.415.742-1.378.082-.166.041-.312-.02-.437-.062-.125-.558-1.347-.763-1.847-.2-.486-.403-.42-.557-.428-.145-.007-.31-.01-.475-.01a.916.916 0 0 0-.662.312c-.227.25-.867.853-.867 2.082 0 1.23.89 2.42 1.014 2.587.125.167 1.752 2.674 4.246 3.75.593.256 1.056.41 1.416.524.597.19 1.14.163 1.57.098.479-.073 1.47-.6 1.677-1.18.207-.577.207-1.077.145-1.18-.062-.104-.227-.166-.475-.29z" />
                </svg>
                JOIN WHATSAPP COMMUNITY
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
