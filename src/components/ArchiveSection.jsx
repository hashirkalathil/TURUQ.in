// src/components/ArchiveSection.jsx

"use client"

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const ArchiveSection = ({ archives = [] }) => {
    const placeholders = [
        { id: 'p1', cover_image: "https://res.cloudinary.com/dgoz15sps/image/upload/v1762400012/turuq/diwszga98wvvx6ovl0f7.webp", name: "Archive Cover 1", slug: "#" },
        { id: 'p2', cover_image: "https://res.cloudinary.com/dgoz15sps/image/upload/v1762400012/turuq/diwszga98wvvx6ovl0f7.webp", name: "Archive Cover 2", slug: "#" },
        { id: 'p3', cover_image: "https://res.cloudinary.com/dgoz15sps/image/upload/v1762400012/turuq/diwszga98wvvx6ovl0f7.webp", name: "Archive Cover 3", slug: "#" }
    ];

    const displayArchives = [...archives.slice(0, 3)];
    while (displayArchives.length < 3) {
        displayArchives.push(placeholders[displayArchives.length]);
    }

    return (
        <div className="archive-content mx-auto flex w-[83%] sm:w-[83%] lg:w-[83%] max-w-[1250px] min-h-[300px] sm:min-h-[350px] lg:max-h-[350px] flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10 rounded-xl sm:rounded-2xl border border-black p-6 sm:p-8 lg:p-[40px] shadow-lg">
            <div className="archive-text flex-1 text-left w-full lg:w-auto">
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

            <div className="flex flex-1 items-end justify-center gap-3 sm:gap-4 lg:gap-5 w-full lg:w-auto mt-0 lg:mt-[-100px]" data-aos="fade-up" data-aos-delay="200">
                {displayArchives.map((archive, index) => {
                    const heightClasses = [
                        "h-[140px] sm:h-[170px] lg:h-[200px] aspect-14/20",
                        "h-[200px] sm:h-[280px] lg:h-[370px] aspect-26/37",
                        "h-[160px] sm:h-[200px] lg:h-[240px] aspect-17/24"
                    ];
                    
                    const widthClasses = [144, 224, 160];
                    const heightValues = [192, 320, 240];

                    return (
                        <div key={archive.id || archive._id || index} className={`${heightClasses[index % 3]} rounded-md sm:rounded-lg overflow-hidden transition-transform hover:-translate-y-2`}>
                            <Link href={archive.slug === "#" ? "/archives" : `/archives/${archive.slug}`}>
                                <Image
                                    unoptimized={true}
                                    src={archive.cover_image || "/placeholder-cover.jpg"}
                                    alt={archive.name || "Archive Cover"}
                                    width={widthClasses[index % 3]}
                                    height={heightValues[index % 3]}
                                    className="h-full w-full object-cover transition-transform cursor-pointer"
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