"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import BackToTop from "@/components/reusable/BackToTop";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";

export default function ClientLayoutWrapper({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const loginPage = pathname === "/admin/login";
  const registerPage = pathname === "/admin/register";

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
    <NotificationProvider>
      {!isAdmin && !loginPage && !registerPage && <Header />}

      {/* Removed the opacity logic for Admin to prevent flickering */}
      <div className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}>
        {children}
      </div>

      {!isAdmin && !loginPage && !registerPage && <Footer />}
      <BackToTop />
    </NotificationProvider>
  );
}
