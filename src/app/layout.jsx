"use client";

import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import BackToTop from "@/components/reusable/BackToTop";
import { NotificationProvider } from "@/components/ui/notification/NotificationProvider";
import "./globals.css";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";


export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const loginPage = pathname === "/admin/login";
  const registerPage = pathname === "/admin/register";

  useEffect(() => {
    if (isAdmin) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, isAdmin]);

  return (
    <html lang="en">
      <head>
        <title>TURUQ | Webzine</title>
        <meta
          name="description"
          content="TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <NotificationProvider>
          {!isAdmin && !loginPage && !registerPage && <Header />}

          {/* Removed the opacity logic for Admin to prevent flickering */}
          <div
            className={loading ? "opacity-50 pointer-events-none" : "opacity-100"}
          >
            {children}
          </div>

          {!isAdmin && !loginPage && !registerPage && <Footer />}
          <BackToTop />
        </NotificationProvider>
      </body>
    </html>
  );
}
