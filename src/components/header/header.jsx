// src/components/header/header.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import CategoryOverlay from './categoryOverlay';
import SearchOverlay from './searchOverlay';
import Image from 'next/image';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    if (!isMenuOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (!isSearchOpen) setIsMenuOpen(false);
  };

  const closeOverlays = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  // Effect to handle body scroll lock when an overlay is open
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isSearchOpen]);

  return (
    <>
      <header className='fixed top-0 left-0 right-0 z-50 bg-[#ffedd9]'>
        <div className="max-w-7xl w-[90%] sm:w-[85%] lg:w-[83%] h-[60px] sm:h-[70px] mx-auto rounded-[30px] sm:rounded-[50px] border border-black flex items-center justify-between px-4 sm:px-6 lg:px-10 mt-[20px] sm:mt-[40px] lg:mt-[60px] relative bg-[#ffedd9]">
          <nav className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Hamburger/Close Button */}
            <div
              className={`hamburger-menu bg-red-600 rounded-full p-1.5 sm:p-2 cursor-pointer border border-black transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-90' : 'hover:bg-red-700'
                }`}
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X size={18} className="sm:w-[22px] sm:h-[22px]" color="#fff" />
              ) : (
                <Menu size={18} className="sm:w-[22px] sm:h-[22px]" color="#fff" />
              )}
            </div>
            {/* Nav Links - Hidden on mobile/tablet */}
            <div className="hidden lg:flex gap-6">
              <Link
                href="/"
                className="font-sans text-base lg:text-lg font-medium text-black transition-colors hover:text-red-600 no-underline whitespace-nowrap"
                onClick={closeOverlays}
              >
                WEBZINE
              </Link>
              <Link
                href="/archives"
                className="font-sans text-base lg:text-lg font-medium text-black transition-colors hover:text-red-600 no-underline whitespace-nowrap"
                onClick={closeOverlays}
              >
                ARCHIVE
              </Link>
            </div>
          </nav>

          {/* Logo - Centered and Responsive */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
            <Link href="/" onClick={closeOverlays}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-red-600 m-0 font-oswald font-semibold whitespace-nowrap">
                TURUQ
              </h1>
            </Link>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Nav Links - Hidden on mobile/tablet */}
            <div className="hidden lg:flex gap-6">
              <Link
                href="/about"
                className="font-sans text-base lg:text-lg font-medium text-black transition-colors hover:text-red-600 no-underline whitespace-nowrap"
                onClick={closeOverlays}
              >
                ABOUT
              </Link>
              <Link
                href="/subscribe"
                className="font-sans text-base lg:text-lg font-medium text-black transition-colors hover:text-red-600 no-underline whitespace-nowrap"
                onClick={closeOverlays}
              >
                SUBSCRIBE
              </Link>
            </div>
            {/* Search Button/Close Button */}
            <div
              className={`search-icon cursor-pointer rounded-full p-1 sm:p-2 transition-colors ${isSearchOpen ? 'bg-red-700 border border-black' : ' bg-none border border-gray-400'
                }`}
              onClick={toggleSearch}
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Image
                  unoptimized={true}
                  src="/search.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  unoptimized
                />
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Categories Overlay Component */}
      <CategoryOverlay isOpen={isMenuOpen} onClose={closeOverlays} />

      {/* Search Overlay Component */}
      <SearchOverlay isOpen={isSearchOpen} onClose={closeOverlays} />

      {/* Adds necessary padding so content doesn't hide behind the fixed header - Responsive */}
      <div className="pt-[100px] sm:pt-[130px] lg:pt-[140px] w-full"></div>
    </>
  );
}