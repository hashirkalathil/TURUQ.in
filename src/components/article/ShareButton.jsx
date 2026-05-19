// src/components/article/ShareButton.jsx
"use client";

import { useState } from "react";
import { VscLiveShare } from "react-icons/vsc";
import { Check, Copy } from "lucide-react";

export default function ShareButton({ title, text, url }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text,
      url: url || window.location.href,
    };

    // 1. Try Native Web Share API (Mobile/Modern Browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share canceled or failed", err);
      }
    } 
    // 2. Fallback: Copy to Clipboard
    else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share this article"
      className="flex flex-row items-center justify-center gap-3 border-2 cursor-pointer border-black rounded-full px-6 py-3 bg-[#ffedd9] hover:bg-black hover:text-white transition-all duration-200 shadow-md hover:shadow-lg group w-full lg:w-auto min-w-[140px]"
    >
      {copied ? (
        <>
          <Check className="h-5 w-5" />
          <span className="font-bold text-sm">COPIED!</span>
        </>
      ) : (
        <>
          <VscLiveShare className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="lg:hidden font-bold text-sm">SHARE ARTICLE</span>
          <span className="hidden lg:inline font-bold text-sm">SHARE</span>
        </>
      )}
    </button>
  );
}