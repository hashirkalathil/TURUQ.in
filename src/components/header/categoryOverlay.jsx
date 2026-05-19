"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2, Layers } from "lucide-react";
import Tag from "../ui/tag";
import "@/app/search-articlecard.css";

// --- UTILS ---
const stripHtml = (html) => {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  return html.replace(/<[^>]*>?/gm, "");
};

export default function CategoryOverlay({ isOpen, onClose }) {
  // --- STATE ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  // Cache stores articles by PARENT CATEGORY SLUG
  const [articlesCache, setArticlesCache] = useState({});
  
  const [activeCategorySlug, setActiveCategorySlug] = useState(null);
  const [activeSubCategorySlug, setActiveSubCategorySlug] = useState(null);
  
  const [metaLoading, setMetaLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Debounce ref
  const hoverTimeoutRef = useRef(null);

  // --- 1. INITIAL METADATA LOAD ---
  useEffect(() => {
    if (isOpen) {
      const fetchMetaData = async () => {
        if (categories.length > 0) return;

        setMetaLoading(true);
        try {
          const [catRes, subCatRes] = await Promise.all([
            fetch("/api/categories"),
            fetch("/api/subcategories"),
          ]);

          const catsData = await catRes.json();
          const subCatsData = await subCatRes.json();

          if (Array.isArray(catsData)) {
            setCategories(catsData);
            if (!activeCategorySlug && catsData.length > 0) {
              setActiveCategorySlug(catsData[0].slug);
            }
          }

          if (Array.isArray(subCatsData)) {
            setSubCategories(subCatsData);
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
        } finally {
          setMetaLoading(false);
        }
      };

      fetchMetaData();
    }
  }, [isOpen, activeCategorySlug, categories.length]);

  // --- HELPERS ---

  const activeCategory = useMemo(() => 
    categories.find((c) => c.slug === activeCategorySlug),
  [categories, activeCategorySlug]);

  const currentSubCategories = useMemo(() => 
    activeCategory
      ? subCategories.filter((sub) => sub.parent_id === activeCategory._id)
      : [],
  [activeCategory, subCategories]);

  // --- 2. ARTICLE FETCHING STRATEGY ---
  useEffect(() => {
    const fetchCategoryFamily = async () => {
      if (!activeCategorySlug) return;

      if (articlesCache[activeCategorySlug]) {
        setArticlesLoading(false);
        return;
      }

      setArticlesLoading(true);
      try {
        const res = await fetch(`/api/articles?category=${activeCategorySlug}`);

        if (res.ok) {
          const rawData = await res.json();
          setArticlesCache((prev) => ({
            ...prev,
            [activeCategorySlug]: rawData,
          }));
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setArticlesLoading(false);
      }
    };

    if (isOpen && activeCategorySlug) {
      fetchCategoryFamily();
    }
  }, [activeCategorySlug, isOpen, articlesCache]);

  // --- 3. FILTERING & CLASSIFICATION LOGIC (THE FIX) ---
  const getDisplayedArticles = useMemo(() => {
    const familyArticles = articlesCache[activeCategorySlug] || [];

    // Filter Step: Only if a subcategory is actively hovered
    const filteredRaw = activeSubCategorySlug
      ? familyArticles.filter(post => {
          const subs = post.subcategory_ids || [];
          // Robust Check: Handle both populated objects ({slug: '...'}) and unpopulated IDs ('690...')
          return subs.some(s => {
             if (typeof s === 'string') {
                // It's an ID, find it in our metadata to get the slug
                const found = subCategories.find(sc => sc._id === s);
                return found?.slug === activeSubCategorySlug;
             }
             // It's an object
             return s.slug === activeSubCategorySlug;
          });
        })
      : familyArticles;

    // Mapping Step
    return filteredRaw.map((post) => {
      const previewText = post.excerpt
        ? post.excerpt
        : stripHtml(post.content).substring(0, 150) + "...";

      let displayTag = null;
      let displayLink = null;

      const subArray = post.subcategory_ids || [];
      const catArray = post.category_ids || [];

      // STRATEGY IMPLEMENTATION
      if (subArray.length > 0) {
        // Case A: Has Subcategories -> Show Subcategory Tag
        let targetSub = null;

        // Try to find the specific sub object (Active or First)
        // Handle mixed ID/Object data
        if (activeSubCategorySlug) {
            targetSub = subArray.find(s => {
                const sSlug = typeof s === 'string' 
                    ? subCategories.find(sc => sc._id === s)?.slug 
                    : s.slug;
                return sSlug === activeSubCategorySlug;
            });
        }
        
        if (!targetSub) targetSub = subArray[0];

        // Resolve Name/Slug if it's just an ID
        if (typeof targetSub === 'string') {
            const found = subCategories.find(sc => sc._id === targetSub);
            if (found) {
                displayTag = found.name;
                displayLink = `/category/${activeCategorySlug}/${found.slug}`;
            }
        } else if (targetSub) {
            displayTag = targetSub.name;
            displayLink = `/category/${activeCategorySlug}/${targetSub.slug}`;
        }

      } 
      
      // Case B: No Subcategories, but has Category -> Show Category Tag
      if (!displayTag && catArray.length > 0) {
         const targetCat = catArray[0];
         // Resolve Name/Slug if it's just an ID
         if (typeof targetCat === 'string') {
             const found = categories.find(c => c._id === targetCat);
             if (found) {
                 displayTag = found.name;
                 displayLink = `/category/${found.slug}`;
             }
         } else if (targetCat) {
             displayTag = targetCat.name;
             displayLink = `/category/${targetCat.slug}`;
         }
      }

      // Case C: Fallback to Current Overlay Category
      if (!displayTag) {
        displayTag = activeCategory?.name;
        displayLink = `/category/${activeCategorySlug}`;
      }

      return {
        _id: post._id,
        title: post.title,
        content: previewText,
        image: post.featured_image || "https://placehold.co/600x400",
        link: `/${post.slug}`,
        displayTag,
        displayLink,
        author: post.author_id?.name || "Author",
        date: new Date(post.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
    });
  }, [articlesCache, activeCategorySlug, activeSubCategorySlug, activeCategory, subCategories, categories]);


  // --- HANDLERS ---

  const handleCategoryInteraction = (slug) => {
    if (slug === activeCategorySlug) return;
    setActiveCategorySlug(slug);
    setActiveSubCategorySlug(null);
  };

  const handleSubCategoryHover = (slug) => {
    if (slug === activeSubCategorySlug) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveSubCategorySlug(slug);
    }, 150);
  };

  const handleResetSubCategory = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveSubCategorySlug(null);
  };

  if (!isOpen) return null;

  return (
    <div className="menu-overlay fixed inset-0 bg-[#ffedd9] z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-[calc(100vh-150px)] flex-col lg:flex-row">
          
          {/* --- LEFT SIDEBAR: CATEGORIES --- */}
          <div className="w-full lg:w-1/4 pt-10 pb-4 lg:pb-10 lg:border-r border-black/10 lg:pr-8 mb-60">
            {metaLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-300 rounded w-3/4"></div>
                ))}
              </div>
            ) : (
              <nav className="flex flex-col flex-wrap lg:block space-y-2 lg:space-y-10">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onMouseEnter={() => handleCategoryInteraction(cat.slug)}
                    onClick={() => handleCategoryInteraction(cat.slug)}
                    className={`text-left flex font-oswald uppercase text-xl lg:text-4xl transition-colors focus:outline-none ${
                      cat.slug === activeCategorySlug
                        ? "text-red-600 font-bold"
                        : "text-black hover:text-red-600"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </nav>
            )}
            <div className="w-full h-px bg-black/10 mt-6 lg:hidden"></div>
          </div>

          {/* --- RIGHT AREA: SUBCATEGORIES & ARTICLES --- */}
          <div className="w-full lg:w-3/4 overflow-y-auto pt-8 lg:pl-8">
            
            {/* 1. Subcategories List */}
            <div className="flex flex-wrap items-center justify-between mb-2 min-h-[50px]">
              <div className="flex flex-wrap gap-2 items-center">
                
                {currentSubCategories.length > 0 && (
                     <div
                        onMouseEnter={handleResetSubCategory}
                        onClick={handleResetSubCategory}
                        className="inline-block cursor-pointer"
                     >
                        <Tag 
                            className={!activeSubCategorySlug ? "bg-black text-white" : "bg-transparent border border-black hover:bg-gray-200"}
                        >
                            ALL
                        </Tag>
                     </div>
                )}

                {currentSubCategories.length > 0 ? (
                  currentSubCategories.map((sub) => (
                    <div
                      key={sub.slug}
                      onMouseEnter={() => handleSubCategoryHover(sub.slug)}
                      onClick={() => handleSubCategoryHover(sub.slug)}
                      className="inline-block cursor-pointer"
                    >
                      <Tag
                        link="#"
                        preventDefault={true} 
                        className={
                          activeSubCategorySlug === sub.slug
                            ? "bg-red-600 text-white border-red-600"
                            : "hover:border-red-600"
                        }
                      >
                        {sub.name}
                      </Tag>
                    </div>
                  ))
                ) : (
                  <span className="text-black/40 text-sm italic">
                    {activeCategory ? `Viewing ${activeCategory.name}` : ""}
                  </span>
                )}
              </div>

              {activeCategory && (
                <Link
                  href={`/category/${activeCategory.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-black transition-colors uppercase ml-auto whitespace-nowrap pl-4"
                >
                  Go to {activeCategory.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* 2. Articles Grid */}
            {articlesLoading ? (
              <div className="flex flex-col items-center justify-center h-60">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                <p className="text-black/50 font-oswald uppercase tracking-widest">Loading Highlights...</p>
              </div>
            ) : (
              <div className="category-article-card-container">
                {getDisplayedArticles.length > 0 ? (
                  getDisplayedArticles.map((article, index) => (
                    <div key={article._id || index} className="h-full animate-in fade-in duration-500">
                      
                      <div className="category-article-card rounded-2xl flex flex-col gap-3 overflow-hidden bg-[#ffedd9] border border-black h-full p-6">
                        
                        <Link
                          href={article.link || "#"}
                          onClick={onClose}
                          className="category-article-image-container w-full block relative"
                        >
                          <div className="w-full h-44 relative overflow-hidden rounded-2xl bg-black/5">
                            <Image
                              src={article.image}
                              alt={article.title || "Article Image"}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform duration-500 hover:scale-105"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          </div>
                        </Link>

                        <div className="category-article-content-container max-h-60 h-auto min-h-[120px] w-full flex flex-col justify-between">
                          <div className="flex items-center min-h-6">
                            {article.displayTag && (
                              <Tag
                                link={article.displayLink}
                                className="z-50 text-[10px] px-2 py-0.5"
                                onClick={onClose}
                              >
                                {article.displayTag.toUpperCase()}
                              </Tag>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <Link href={article.link || "#"} onClick={onClose}>
                              <h3 className="local-font-rachana font-bold text-[24px] sm:text-[30px] cursor-pointer leading-8 text-red-600 hover:text-red-700 transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                            </Link>
                            <div className="category-article-content hidden local-font-rachana text-gray-700 line-clamp-2 text-base sm:text-[18px] leading-5">
                              {article.content}
                            </div>
                          </div>

                          <div className="text-sm border-t border-black/10 pt-2 mt-2 flex items-center gap-2">
                            <span className="font-poppins font-semibold text-xs text-black">
                              {article.author}
                            </span>
                            <span className="text-black/30 font-semibold text-sm">|</span>
                            <span className="text-xs font-semibold text-black/50">
                              {article.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <Layers className="w-12 h-12 text-black/20 mb-4" />
                    <p className="text-black/50 local-font-rachana text-xl">
                      No highlights available for{" "}
                      <span className="text-red-600 font-bold">
                        {activeSubCategorySlug
                          ? currentSubCategories.find(s => s.slug === activeSubCategorySlug)?.name
                          : activeCategory?.name}
                      </span>
                      .
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}