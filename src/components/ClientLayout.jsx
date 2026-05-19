"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";

export default function ClientLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname?.startsWith("/admin");
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";
  const shouldHideLayout = isAdmin || isAuthPage; 

  useEffect(() => {
    if (isAdmin) return;

    let timer;
    const startLoading = () => {
      setLoading(true);
      timer = setTimeout(() => {
        setLoading(false);
      }, 300);
    };

    const requestTimer = setTimeout(startLoading, 0);

    return () => {
      clearTimeout(requestTimer);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, isAdmin]);

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Render Header unless it's an admin/auth page */}
      {!shouldHideLayout && <Header />}

      <div className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}>
        {children}
      </div>

      {/* Render Footer unless it's an admin/auth page */}
      {!shouldHideLayout && <Footer />}
    </>
  );
}