// src/components/ArchiveSection.jsx

"use client"

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ArchiveSection = ({ archives = [] }) => {
    const placeholders = [
        { id: 'p1', cover_image: "https://res.cloudinary.com/dm9o2xx0h/image/upload/v1771492823/turuq/sz61iq6nai1ajo5rok5z.webp", name: "Archive Cover 1", slug: "#" },
        { id: 'p2', cover_image: "https://res.cloudinary.com/dm9o2xx0h/image/upload/v1771492823/turuq/sz61iq6nai1ajo5rok5z.webp", name: "Archive Cover 2", slug: "#" },
        { id: 'p3', cover_image: "https://res.cloudinary.com/dm9o2xx0h/image/upload/v1771492823/turuq/sz61iq6nai1ajo5rok5z.webp", name: "Archive Cover 3", slug: "#" }
    ];

    const displayArchives = [...archives.slice(0, 3)];
    while (displayArchives.length < 3) {
        displayArchives.push(placeholders[displayArchives.length]);
    }

  return (
    <div className="archive-content mx-auto flex w-[83%] sm:w-[83%] lg:w-[83%] max-w-[1250px] min-h-[300px] sm:min-h-[350px] lg:max-h-[350px] flex-col-reverse lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-12 rounded-xl sm:rounded-2xl border border-black p-6 sm:p-8 lg:p-[40px] shadow-lg bg-white/20">
      <div className="archive-text flex-1 text-center lg:text-left w-full lg:w-auto flex flex-col items-center lg:items-start">
        <h2 className="archive-title text-2xl sm:text-3xl lg:text-[45px] font-bold leading-tight sm:leading-[40px] lg:leading-[50px] uppercase text-[#1d1d1d]">
          Explore Our Exclusive Archives
        </h2>
        <p className="archive-subtitle text-base sm:text-lg lg:text-xl text-[#2b2b2b] mt-2">
          For Weekly Webzines
        </p>
        <Link
          href="/archives"
          className="archive-btn relative mt-4 sm:mt-6 inline-flex items-center gap-2 overflow-hidden rounded-lg bg-[#c94333] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold uppercase text-white transition-all hover:bg-[#a83227] hover:shadow-lg"
        >
          View more
          <ArrowRight size={16} className="sm:w-4 sm:h-4" />
        </Link>
      </div>

      <div className="flex flex-1 items-end justify-center gap-3 sm:gap-4 lg:gap-5 w-full lg:w-auto mt-6 lg:mt-[-75px]" data-aos="fade-up" data-aos-delay="200">
        {displayArchives.map((archive, index) => {
          const heightClasses = [
            "h-[130px] sm:h-[180px] lg:h-[230px] aspect-[14/20]",
            "h-[180px] sm:h-[260px] lg:h-[330px] aspect-[26/37]",
            "h-[140px] sm:h-[180px] lg:h-[230px] aspect-[17/24]"
          ];

          return (
            <div 
              key={archive.id || archive._id || index} 
              className={`${heightClasses[index % 3]} relative rounded-md sm:rounded-lg overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-2 bg-white`}
            >
              <Link href={archive.slug === "#" ? "/archives" : `/archives/${archive.slug}`}>
                <Image
                  unoptimized={true}
                  src={archive.cover_image || "/placeholder-cover.jpg"}
                  alt={archive.name || "Archive Cover"}
                  fill
                  sizes="(max-width: 768px) 33vw, 15vw"
                  className="object-cover transition-transform cursor-pointer"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArchiveSection;