// src/components/admin/Header.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  LoaderCircle
} from "lucide-react";
import { useNotification } from "../ui/notification/NotificationProvider";

export default function Header({ currentUser, isSidebarOpen, setIsSidebarOpen }) {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { addNotification } = useNotification();
  const [ddOpen, setDdOpen] = useState(false);

  const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDd = () => setDdOpen((p) => !p);

  const Logout = async (e) => {
    e?.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    try {
      const logoutUrl = window.location.origin + "/api/auth/logout";

      const response = await fetch(logoutUrl, { method: "POST" });

      if (response.ok) {
        addNotification("success", "Logged out successfully");
        window.location.href = "/admin/login";
      } else {
        const result = await response.json();
        addNotification("error", result.message || "Failed to log out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      addNotification("error", "A network error occurred");
    }
  };

  const AvatarIcon = () =>
    currentUser?.avatar ? (
      <Image
        src={currentUser.avatar}
        alt="avatar"
        width={32}
        height={32}
        className="rounded-full border-2 border-black object-cover"
      />
    ) : (
      <div className="w-8 h-8 rounded-full border-2 border-black bg-background grid place-items-center">
        <User className="w-5 h-5 text-black" />
      </div>
    );

  return (
    <header className="fixed bg-background top-0 left-0 w-full z-50 pb-[10px]">
      <div className="relative w-4/5 h-[70px] mx-auto mt-[30px] px-10 rounded-[50px] border border-black bg-background flex items-center justify-between">
        
        {/* hamburger */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className={`relative z-1000 w-10 h-10 rounded-full border border-black grid place-items-center transition-transform duration-500 ${
            isSidebarOpen ? "rotate-180" : ""
          }`}
          style={{ background: "var(--clr-button)" }}
        >
          <span
            className={`absolute h-[3px] w-5 bg-white rounded-full transition-all duration-300 ${
              isSidebarOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[12px]"
            }`}
          />
          <span
            className={`absolute h-[3px] w-5 bg-white rounded-full transition-all duration-300 ${
              isSidebarOpen ? "opacity-0 w-0" : "top-[18px]"
            }`}
          />
          <span
            className={`absolute h-[3px] w-5 bg-white rounded-full transition-all duration-300 ${
              isSidebarOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[24px]"
            }`}
          />
        </button>

        {/* logo – dead centre */}
        <Link
          href="/admin"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <h1 className="font-['Oswald'] text-[40px] font-medium text-[#d64545] m-0">
            TURUQ
          </h1>
        </Link>
        
        {/* avatar + dropdown */}
        <div className="relative">
          <button
            onClick={toggleDd}
            className={`flex items-center gap-2 px-3 py-2 rounded-[25px] border transition-all hover:-translate-y-0.5 hover:shadow-md ${
              ddOpen
                ? "bg-background border-black shadow-lg"
                : "bg-black/5 border-transparent"
            }`}
          >
            <AvatarIcon />
            <ChevronDown
              className={`w-3 h-3 text-black transition-transform ${
                ddOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* dropdown panel */}
          <div
            className={`absolute right-0 top-full mt-2 w-[220px] bg-background border-2 border-black rounded-[15px] shadow-xl overflow-hidden transition-all origin-top-right
              ${
                ddOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
          >
            {/* header */}
            <div className="px-5 pt-4 pb-3 bg-black/5">
              <p className="font-semibold text-black">{currentUser?.name}</p>
              <p className="text-xs text-gray-600">{currentUser?.email}</p>
            </div>

            <div className="h-px bg-black/30" />

            {/* links */}
            <nav className="py-2">
              <Link
                href="/admin/profile"
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-black/5"
              >
                <User className="w-[18px] h-[18px]" />
                My Account
              </Link>

              <Link
                href="/admin"
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium hover:bg-black/5"
              >
                <LayoutDashboard className="w-[18px] h-[18px]" />
                Dashboard
              </Link>

              <div className="h-px bg-black/30 my-1" />

              <button
                onClick={Logout}
                className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm font-medium text-[#d64545] hover:bg-red-50 w-full"
              >
                <LogOut className="w-[18px] h-[18px]" />
                {logoutLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Logout"
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}