import Link from "next/link";
import { BookOpen, Compass, Award, ArrowRight, GraduationCap } from "lucide-react";

export const metadata = {
  title: "About Us | TURUQ",
  description: "Turuq.in is a Malayalam web portal published by Sabeelul Hidaya Islamic College, envisioned as a space where knowledge, creativity, reflection, and responsible discourse come together.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-[#171717] py-16 px-4 md:px-8 lg:px-12 flex flex-col items-center">
      {/* Editorial Header Section */}
      <div className="max-w-4xl w-full text-center space-y-6 mb-16 animate-in fade-in slide-in-from-top-6 duration-700">        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-oswald font-black uppercase text-black leading-none tracking-tight">
          ABOUT <span className="text-red-600">TURUQ</span>
        </h1>
        
        <p className="text-lg md:text-xl font-poppins font-light text-black/60 max-w-2xl mx-auto italic">
          "Where knowledge, creativity, reflection, and responsible discourse converge."
        </p>

        <div className="flex justify-center items-center gap-4">
          <div className="h-[2px] w-12 bg-black"></div>
          <div className="h-2 w-2 rounded-full bg-red-600"></div>
          <div className="h-[2px] w-12 bg-black"></div>
        </div>
      </div>

      {/* Main Core Showcase Card - Heavy Border & Soft Background */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        {/* Left Side: Editorial Banner */}
        <div className="lg:col-span-5 p-8 md:p-10 rounded-[30px] border-2 border-black bg-white flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-black group-hover:rotate-12 transition-transform duration-700">
            <BookOpen size={200} />
          </div>
          
          <div className="space-y-6 relative z-10">
            <h2 className="text-3xl font-oswald font-bold uppercase tracking-tight text-black">
              ROOTED IN <br />
              <span className="text-red-600">SEMI-ACADEMIC</span> SPIRIT
            </h2>
            
            <p className="text-lg md:text-xl font-rachana text-black/80 italic leading-relaxed pt-2 border-l-4 border-red-600 pl-4">
              "Envisioned as a space where knowledge, creativity, and responsible expression come together to engage modern minds."
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 border border-red-600/20">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-xs text-black/50 font-poppins font-medium uppercase">Published by</p>
              <p className="text-sm text-black font-semibold font-poppins">Sabeelul Hidaya Islamic College</p>
            </div>
          </div>
        </div>

        {/* Right Side: Descriptive Column */}
        <div className="lg:col-span-7 p-8 md:p-12 rounded-[30px] border-2 border-black bg-[#fff6ec] flex flex-col justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-2xl font-oswald font-bold uppercase text-black tracking-wide mb-6">
            The Digital Portal
          </h3>
          
          <p className="text-xl md:text-2xl font-rachana text-black/90 leading-[1.8] text-justify">
            Turuq.in is a Malayalam web portal published by Sabeelul Hidaya Islamic College, 
            envisioned as a space where knowledge, creativity, reflection, and responsible discourse 
            come together. Rooted in a semi-academic spirit, the platform features writings that 
            engage with literature, language, society, culture, ideas, and contemporary concerns 
            through thoughtful and meaningful expression.
          </p>
        </div>
      </div>

      {/* Premium College Profile & Engagement */}
      <div className="max-w-5xl w-full p-8 md:p-12 rounded-[40px] border-2 border-black bg-black/85 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_60%)] pointer-events-none"></div>
        
        <div className="space-y-4 max-w-xl text-center lg:text-left relative z-10">
          <h2 className="text-3xl md:text-4xl font-oswald font-black uppercase tracking-tight">
            SABEELUL HIDAYA <br className="hidden md:inline" />
            <span className="text-red-500">ISLAMIC COLLEGE</span>
          </h2>
          <p className="text-sm md:text-base font-poppins text-gray-400 leading-relaxed">
            As a leading academic institution, Sabeelul Hidaya Islamic College sponsors Turuq.in to cultivate progressive, balanced, and deeply researched literature in Malayalam, bridging the gap between traditional learning and modern communication.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10 shrink-0">
          <Link
            href="/"
            className="h-14 px-8 rounded-full bg-white text-black font-oswald font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95 shadow-lg whitespace-nowrap"
          >
            EXPLORE ARTICLES
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/subscribe"
            className="h-14 px-8 rounded-full border border-white bg-transparent text-white font-oswald font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all active:scale-95 whitespace-nowrap"
          >
            JOIN NEWSLETTER
          </Link>
        </div>
      </div>
    </main>
  );
}
