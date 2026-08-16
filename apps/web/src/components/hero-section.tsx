"use client";

import { motion } from "framer-motion";
import { Flame, ChevronRight, ChevronDown } from "lucide-react";
import FloatingFood from "./floating-food";
import Logo from "./logo";

interface HeroSectionProps {
  onStartClick: () => void;
}

export function HeroSection({ onStartClick }: HeroSectionProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingFood
          delay={0.3}
          rotate={-5}
          image="/frying_pan.png"
          className="hidden sm:block left-[5%] top-[15%]"
        />

        <FloatingFood
          delay={0.5}
          rotate={8}
          image="/fire.png"
          className="hidden sm:block right-[8%] top-[18%]"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            custom={1.5}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 md:mb-6">
              <Logo size="xl" withLink={false} withAnimation={false} />
            </div>
          </motion.div>
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-2xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8 space-y-4">
              <div className="flex justify-end mr-[0px] sm:mr-[-50px] md:mr-[-80px]">
                <div className="relative inline-block max-w-md">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-200">
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light">
                      Two players debate a topic.
                    </p>
                  </div>
                  <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
                  <div className="absolute -bottom-[11px] right-[23px] w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[13px] border-t-gray-200 -z-10" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="relative inline-block max-w-md">
                  <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-200">
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-light">
                      Each turn gets scored by an AI judge for{" "}
                      <span className="font-medium text-orange-600">logic</span>,{" "}
                      <span className="font-medium text-red-500">clarity</span>,{" "}
                      <span className="font-medium text-yellow-600">evidence</span>, and{" "}
                      <span className="font-medium text-green-600">civility</span>.
                    </p>
                  </div>
                  <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
                  <div className="absolute -bottom-[11px] left-[23px] w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[13px] border-t-gray-200 -z-10" />
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={onStartClick}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-base md:text-lg font-medium flex items-center gap-2 mx-auto transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Cooking <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
          <motion.p
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 text-gray-500 text-sm"
          >
            Free to play. No sign-up required.
          </motion.p>
        </div>
      </div>
      
      {/* People at podiums */}
      <motion.div 
        custom={2.5}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
      >
        <img 
          src="/people.png" 
          alt="" 
          className="w-full max-w-7xl mx-auto h-auto object-contain"
          style={{ 
            maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)'
          }}
        />
      </motion.div>
    </div>
  );
}

export default HeroSection;
