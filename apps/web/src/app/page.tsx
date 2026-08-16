"use client";

import { motion } from "framer-motion";
import HeroSection from "@/components/hero-section";
import { HowItWorksSection, ReadyToCookSection } from "@/components/sections";

export default function Home() {
  const handleStartClick = () => {
    const element = document.getElementById("ready-to-cook");
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset + 50;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 flex flex-col overflow-x-hidden relative">
      <div className="h-screen w-full relative">
        <motion.div 
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 0.25,
            backgroundPosition: ['0px 0px', '120px 120px']
          }}
          transition={{
            opacity: { duration: 1.5, ease: "easeOut" },
            backgroundPosition: { duration: 10, repeat: Infinity, ease: "linear" }
          }}
          style={{
            backgroundImage: `url("/ForkKnife.png")`,
            backgroundSize: '120px 120px',
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-100/40 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="h-full z-10 relative">
          <HeroSection onStartClick={handleStartClick} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-amber-50/50 to-amber-50/80 pointer-events-none z-20" />
      </div>
      <HowItWorksSection />
      <ReadyToCookSection />
      <footer className="pb-4 px-4 text-center text-xs sm:text-sm bg-amber-50 backdrop-blur-sm text-gray-600 w-full">
        <p>Settle debates with AI.</p>
        <p>&copy; {new Date().getFullYear()} Did I Cook?</p>
      </footer>
    </div>
  );
}
