// src/components/header/searchOverlay.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Tag from "../ui/tag";

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setLoading(false);
    }
  }, [isOpen]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  const ResultCard = ({ result }) => (
    <div className="h-full bg-background flex flex-col article-card rounded-xl border border-black p-5 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      {/* Image Section */}
      <Link href={result.link} onClick={onClose} className="block mb-4">
        <div className="article-image h-[200px] w-full overflow-hidden rounded-xl">
          <Image
            src={result.image}
            alt={result.title}
            width={400}
            height={250}
            sizes="(max-width: 768px) 100vw, 25vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>

      {/* Categories Tag Section */}
      <div className="flex flex-wrap gap-2 mb-3">
        {result.categories.map((cat, idx) => (
          <Tag
            key={idx}
            link={cat.link} // Uses the link from the API object
            className="z-50 w-fit"
          >
            {cat.name} {/* Renders the name from the API object */}
          </Tag>
        ))}
      </div>

      {/* Title Section */}
      <Link href={result.link} onClick={onClose} className="grow">
        <h3 className="article-title local-font-rachana text-[25px] h-[70px] overflow-hidden font-bold leading-[22px] py-1 text-[#a82a2a] hover:text-red-700 transition-colors">
          {result.title}
        </h3>
      </Link>

      {/* Meta Section */}
      <div className="article-meta flex items-center gap-2">
        <span className="author text-xs font-normal text-black">{result.author}</span>
        <span className="divider text-xs text-black">|</span>
        <span className="date text-xs font-normal text-black opacity-45">{result.date}</span>
      </div>
    </div>
  );

  return (
    <div className="search-overlay fixed inset-0 bg-background z-40 pt-[150px] overflow-y-auto transition-opacity duration-300 ease-in-out">
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="font-oswald text-4xl text-black text-center mb-12 uppercase">
          SEARCH HERE
        </h2>

        {/* Search Bar */}
        <form onSubmit={handleFormSubmit} className="mb-16">
          <div className="flex items-center border border-black rounded-[50px] bg-background p-2.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="TYPE SOMETHING........"
              className="font-poppins text-2xl w-full bg-transparent outline-none px-10 py-2.5 placeholder:text-gray-400"
              aria-label="Search input"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-4 shrink-0 rounded-full p-3 transition-transform duration-200 hover:scale-105 disabled:opacity-70 cursor-pointer"
              aria-label="Submit search"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 text-black animate-spin" />
              ) : (
                <Image
                  src="/search.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="mr-3 w-7 h-7 sm:w-8 sm:h-8"
                  unoptimized
                />
              )}
            </button>
          </div>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <ResultCard key={result.id || index} result={result} />
          ))}
        </div>

        {/* Empty State Message */}
        {hasSearched &&
          !loading &&
          results.length === 0 &&
          query.trim() !== "" && (
            <div className="text-center text-gray-500 mt-10">
              <p className="font-sans text-lg">
                No results found for &quot;{query}&quot;
              </p>
            </div>
          )}

        {/* See More Button */}
        {results.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-red-600 text-white font-bold py-3 px-12 rounded-full border border-red-600 transition-all duration-300 hover:bg-background hover:text-red-600 shadow-xl">
              SEE MORE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}