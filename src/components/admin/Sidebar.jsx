// src/components/admin/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Package,
  Presentation,
  MessageSquare,
  PenTool,
  Users,
  Mail,
  Settings,
} from "lucide-react";

const mainNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    match: ["", "index"],
  },
  { label: "Posts", href: "/admin/posts", icon: FileText },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Slides", href: "/admin/slides", icon: Presentation },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Authors", href: "/admin/authors", icon: PenTool },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscription", href: "/admin/subscription", icon: Mail },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const webzineItems = [
  { label: "Webzines", href: "/admin/webzines", icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href, match) => {
    const clean = pathname.split("?")[0];
    if (match)
      return match.some((m) => clean === `/admin/${m}` || clean === "/admin");
    return clean === href;
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const renderNavItem = (item, idx, totalLength) => {
    const active = isActive(item.href, item.match);
    return (
      <motion.div
        key={item.href}
        variants={itemVariants}
        animate="visible"
        className="relative"
      >
        <Link
          href={item.href}
          className={`relative flex items-center gap-3 px-[34px] py-2 text-black no-underline font-medium text-[14px] transition-all duration-300 group ${
            active ? "bg-[#f2cfa6]" : "hover:bg-[#f2cfa6]/50"
          }`}
        >
          {/* Active indicator */}
          {active && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
              }}
            />
          )}

          {/* Icon with animation */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`relative ${
              active
                ? "text-orange-600"
                : "text-gray-700 group-hover:text-orange-500"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </motion.div>

          {/* Label */}
          <motion.span
            className={`transition-colors duration-300 ${
              active
                ? "text-gray-900 font-semibold"
                : "text-gray-700 group-hover:text-gray-900"
            }`}
          >
            {item.label}
          </motion.span>

          {/* Hover effect background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-200/0 via-orange-200/20 to-orange-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ pointerEvents: "none" }}
          />
        </Link>

        {/* Divider logic: Show divider only if it's NOT the last item in this specific list */}
        {idx < totalLength - 1 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: idx * 0.05 + 0.3, duration: 0.3 }}
            className="w-[70%] h-px bg-gradient-to-r from-transparent via-black/20 to-transparent mx-auto my-1"
            style={{ originX: 0.5 }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <motion.aside
      initial={false}
      className="sticky top-[120px] min-w-[250px] h-fit bg-[#ffedd9] border-2 border-black rounded-[20px] py-6 flex flex-col mx-auto shadow-lg overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-transparent pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative px-[34px] mb-4"
      >
        <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full" />
      </motion.div>

      <nav className="relative">
        {/* Render Main Items */}
        {mainNavItems.map((item, idx) =>
          renderNavItem(item, idx, mainNavItems.length)
        )}

        {/* Section Divider for Webzines */}
        <div className="mt-4 mb-2 px-[34px]">
          <div className="h-1 bg-amber-500 mb-2" />
        </div>

        {/* Render Webzine Items */}
        {webzineItems.map((item, idx) =>
          renderNavItem(item, idx, webzineItems.length)
        )}
      </nav>

      {/* Footer decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative mt-6 px-[34px]"
      >
        <div className="flex items-center justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
            />
          ))}
        </div>
      </motion.div>
    </motion.aside>
  );
}