// src/components/HeroSection.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Tag from "./ui/tag";

export default function HeroSection({ articles }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Swipe State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const currentSlide = articles && articles.length > 0 ? articles[currentIndex] : null;
  const totalSlides = articles ? articles.length : 0;
  const fadeDuration = 200;
  const slideDuration = 5000;

  const handleNext = useCallback(() => {
    const changeSlide = (newIndex) => {
      if (newIndex === currentIndex) return;
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsFading(false);
      }, fadeDuration);
    };
    const newIndex = (currentIndex + 1) % totalSlides;
    changeSlide(newIndex);
  }, [currentIndex, totalSlides]);

  const handlePrev = useCallback(() => {
    const changeSlide = (newIndex) => {
      if (newIndex === currentIndex) return;
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsFading(false);
      }, fadeDuration);
    };
    const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    changeSlide(newIndex);
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    if (totalSlides === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, slideDuration);

    return () => clearInterval(timer);
  }, [handleNext, totalSlides]);

  if (!articles || articles.length === 0 || !currentSlide) {
    return null;
  }

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  const title = currentSlide.title;
  const description = currentSlide.description;
  const link = `/${currentSlide.slug}`;
  const image = currentSlide.imageSrc;
  const categories = currentSlide.categories || [];
  const author = currentSlide.author;
  const date = currentSlide.date;

  return (
    <section
      className="mb-20 w-full"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto flex w-[83%] max-w-[1250px] h-fit md:h-[450px] flex-col-reverse lg:flex-row items-center justify-between gap-5 lg:gap-10 overflow-hidden rounded-2xl border border-black p-5 lg:p-10 relative">
        {/* Left Content Area */}
        <div className="w-full h-full md:h-auto p-0 flex flex-1 flex-col justify-between gap-[5px] lg:gap-[25px] overflow-hidden">
          <div className="transition-opacity duration-200 ease-in-out flex flex-col justify-between gap-2 lg:gap-4" style={{ opacity: isFading ? 0 : 1 }}>
            {/* Tags */}
            <div className="flex gap-1 md:gap-2">
              {categories.map((cat, index) => (
                <Tag key={index} link={cat.link}>
                  {cat.name}
                </Tag>
              ))}
            </div>

            <div className="flex-col gap-2">

              {/* Title */}
              <Link href={link}>
                <h2
                  spellCheck="false"
                  className="local-font-rachana h-fit text-[25px] line-clamp-3 md:line-clamp-3 lg:text-[45px] font-extrabold leading-[30px] lg:leading-[50px] text-[#a82a2a] hover:text-red-700 transition-colors"
                >
                  {title}
                </h2>
              </Link>

              {/* Description */}
              <p
                spellCheck="false"
                className="local-font-rachana hidden md:block line-clamp-1 lg:line-clamp-3 text-[18px] leading-tight font-normal text-black"
              >
                {description}
              </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-poppins author text-xs lg:text-sm text-black">
                {author}
              </span>
              <span className="divider text-xs text-black">|</span>
              <span className="date text-[10px] lg:text-xs font-normal text-black opacity-45">
                {date}
              </span>
            </div>
          </div>

          {/* Pagination & Controls (Fixed, No Fade) */}
          <div className="flex w-full items-center gap-4 mt-auto">
            {/* Pagination */}
            <div className="pagination flex items-baseline gap-1.5 font-normal text-black font-oswald shrink-0 select-none">
              <span className="tabular-nums text-xl lg:text-2xl font-bold leading-none">
                {(currentIndex + 1).toString().padStart(2, "0")}
              </span>
              <span className="text-sm opacity-70 leading-none">-</span>
              <span className="tabular-nums text-xs md:text-sm opacity-50 leading-none">
                {totalSlides.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Linear Loader (Progress Bar) */}
            <div className="relative flex-1 h-1 bg-red-100 rounded-full overflow-hidden">
              <div
                key={currentIndex}
                className="absolute top-0 left-0 h-full bg-red-700 animate-linear-timer"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black/30 bg-red-600 transition-colors hover:bg-red-700 cursor-pointer"
                aria-label="Previous article"
              >
                <ArrowLeft size={16} color="white" />
              </button>
              <button
                onClick={handleNext}
                className="nav-btn flex h-7 w-10 items-center justify-center rounded border border-black/30 bg-red-600 transition-colors hover:bg-red-700 cursor-pointer"
                aria-label="Next article"
              >
                <ArrowRight size={16} color="white" />
              </button>
            </div>

            <style jsx>{`
              .animate-linear-timer {
                animation: linearProgress ${slideDuration}ms linear forwards;
              }
              @keyframes linearProgress {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        </div>

        <div
          className="shrink-0 h-52 lg:h-full lg:max-h-[430px] w-full lg:w-[50%] max-w-[700px] overflow-hidden rounded-2xl transition-opacity duration-200 ease-in-out"
          style={{ opacity: isFading ? 0 : 1 }}
        >
          <Link href={link} className="block h-full w-full">
            <Image
              unoptimized={true}
              key={currentSlide.id || currentIndex}
              src={image}
              alt={title}
              width={630}
              height={430}
              className="h-full w-full object-cover rounded-2xl transition-transform duration-500 ease-in-out hover:scale-[1.02]"
              priority
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/630x430/ccc/333?text=Image+Load+Error";
              }}
            />
          </Link>
        </div>
      </div>


    </section>
  );
}
