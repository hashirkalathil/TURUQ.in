"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export default function MobileNavbar({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [catRes, subCatRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/subcategories"),
          ]);
          const catsData = await catRes.json();
          const subCatsData = await subCatRes.json();

          if (Array.isArray(catsData)) setCategories(catsData);
          if (Array.isArray(subCatsData)) setSubCategories(subCatsData);
        } catch (error) {
          console.error("Error fetching mobile nav data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const toggleCategory = (slug) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#ffedd9] z-[60] flex flex-col transition-all duration-300 ease-in-out lg:hidden overflow-y-auto">
      {/* Header for Mobile Nav */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-black/10">
        <h2 className="text-2xl font-oswald font-semibold text-red-600">MENU</h2>
        <button onClick={onClose} className="p-2 bg-red-600 rounded-full text-white">
          <X size={24} />
        </button>
      </div>

      {/* Main Links */}
      <div className="px-6 py-8 flex flex-col gap-6">
        <Link href="/webzine" onClick={onClose} className="text-xl font-oswald uppercase text-black hover:text-red-600">
          WEBZINE
        </Link>
        <Link href="/archives" onClick={onClose} className="text-xl font-oswald uppercase text-black hover:text-red-600">
          ARCHIVE
        </Link>
        <Link href="/about" onClick={onClose} className="text-xl font-oswald uppercase text-black hover:text-red-600">
          ABOUT
        </Link>
        <Link href="/subscribe" onClick={onClose} className="text-xl font-oswald uppercase text-black hover:text-red-600">
          SUBSCRIBE
        </Link>
      </div>

      <div className="h-px bg-black/10 mx-6 mb-8"></div>

      {/* Categories Section */}
      <div className="px-6 pb-20 flex flex-col gap-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Categories</h3>
        {loading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-black/5 rounded-lg"></div>
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const hasSubs = subCategories.some(sub => sub.parent_id === cat._id);
            const isExpanded = expandedCategory === cat.slug;

            return (
              <div key={cat.slug} className="flex flex-col border-b border-black/5 last:border-0">
                <div className="flex items-center justify-between py-4">
                  <Link 
                    href={`/category/${cat.slug}`} 
                    onClick={onClose}
                    className="text-xl font-oswald uppercase text-black hover:text-red-600 flex-1"
                  >
                    {cat.name}
                  </Link>
                  {hasSubs && (
                    <button 
                      onClick={() => toggleCategory(cat.slug)}
                      className="p-2 text-black/50"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
                
                {/* Subcategories with Smooth Transition */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-red-600/20">
                    {subCategories
                      .filter(sub => sub.parent_id === cat._id)
                      .map(sub => (
                        <Link 
                          key={sub.slug}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          onClick={onClose}
                          className="text-lg font-rachana text-black/70 hover:text-red-600"
                        >
                          {sub.name}
                        </Link>
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
