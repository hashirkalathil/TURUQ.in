// components/Footer.jsx
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BsTwitterX, BsInstagram, BsFacebook } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-background mt-[80px] lg:mt-[120px]">
      <div className="border-t border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex flex-col md:flex-row items-center justify-between w-full max-w-[1250px] px-6 lg:px-[8.5%] py-10 md:py-8 gap-8 md:gap-0">
          <div className="footer-logo">
            <h2 className="font-oswald text-[32px] md:text-[45px] font-medium text-main-text m-0 tracking-tight">TURUQ</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-[60px] lg:gap-[75px]">
            <a href="#" className="flex items-center gap-2 font-poppins text-[14px] md:text-[15px] font-medium text-gray-600 hover:text-[#d64545] transition-all duration-300 group">
              <BsFacebook className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="capitalize">Facebook</span>
            </a>
            <a href="#" className="flex items-center gap-2 font-poppins text-[14px] md:text-[15px] font-medium text-gray-600 hover:text-[#d64545] transition-all duration-300 group">
              <BsInstagram className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="capitalize">Instagram</span>
            </a>
            <a href="#" className="flex items-center gap-2 font-poppins text-[14px] md:text-[15px] font-medium text-gray-600 hover:text-[#d64545] transition-all duration-300 group">
              <BsTwitterX className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="capitalize">X.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1250px] px-6 lg:px-[8.5%] py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:text-left">
          <span className="font-poppins text-[14px] font-normal text-gray-500">
            © {new Date().getFullYear()} TURUQ. All rights reserved.
          </span>

          <span className="font-poppins text-[13px] font-normal text-gray-400">
            Crafted with passion by{" "}
            <Link
              href="https://yourname.in"
              className="inline-flex items-center gap-1.5 text-[#d64545] font-semibold hover:underline underline-offset-4 transition-all"
            >
              yourname
              <ExternalLink size={12} className="opacity-70" />
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
