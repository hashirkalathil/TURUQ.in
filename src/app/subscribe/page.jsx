"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
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
        setSubscribed(true);
        addNotification("success", data.message);
      } else {
        addNotification("error", data.error);
      }
    } catch (error) {
      addNotification("error", "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-background">
      <div className="max-w-2xl w-full text-center space-y-8 p-10 lg:p-16 rounded-[40px] border border-black bg-[#ffedd9] shadow-2xl">
        {!subscribed ? (
          <>
            <div className="flex justify-center">
              <div className="p-5 bg-red-600 rounded-full text-white shadow-lg animate-bounce">
                <Mail size={48} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-oswald font-bold text-black uppercase">
                Stay in the Loop
              </h1>
              <p className="text-lg lg:text-xl font-rachana text-black/70 max-w-md mx-auto leading-relaxed">
                Join our exclusive community and receive the latest stories, cultural insights, and updates directly in your inbox.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative max-w-md mx-auto group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-16 px-6 rounded-full border border-black bg-white text-black font-rachana text-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 h-12 px-6 rounded-full bg-red-600 text-white font-oswald font-bold flex items-center gap-2 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "JOINING..." : "SUBSCRIBE"}
                <Send size={18} />
              </button>
            </form>

            <p className="text-xs text-black/40 font-poppins">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </>
        ) : (
          <div className="space-y-6 py-10 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-oswald font-bold text-black uppercase">Welcome Aboard!</h2>
              <p className="text-xl font-rachana text-black/70">
                You've successfully joined our mailing list. Keep an eye on your inbox!
              </p>
            </div>
            <button 
              onClick={() => setSubscribed(false)}
              className="text-red-600 font-oswald font-bold hover:underline"
            >
              SUBSCRIBE ANOTHER EMAIL
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
