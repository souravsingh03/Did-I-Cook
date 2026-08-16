"use client";

import { motion } from "framer-motion";

interface FloatingFoodProps {
  className?: string;
  delay?: number;
  rotate?: number;
  emoji?: string;
  image?: string;
}

export function FloatingFood({
  className = "",
  delay = 0,
  rotate = 0,
  emoji = "🍳",
  image,
}: FloatingFoodProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        rotate: rotate - 5,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate,
      }}
      transition={{
        duration: 1.8,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1 },
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* Placeholder container for future food drawings */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white/80 backdrop-blur-sm border border-orange-200/50 shadow-lg flex items-center justify-center">
          {image ? (
            <img src={image} alt="" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
          ) : (
            <span className="text-4xl sm:text-5xl md:text-6xl">{emoji}</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FloatingFood;
