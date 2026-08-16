"use client";

import { Chewy } from "next/font/google";
import { motion } from "framer-motion";
import Link from "next/link";

const chewy = Chewy({
  subsets: ["latin"],
  weight: ["400"],
});

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withLink?: boolean;
  withAnimation?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  withLink = true,
  withAnimation = false,
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl lg:text-6xl",
    xl: "text-6xl sm:text-7xl md:text-8xl lg:text-9xl",
  };

  const hatSizes = {
    sm: "w-5 h-5 -top-2 -left-1.5 -rotate-12",
    md: "w-6 h-6 -top-3 -left-2 -rotate-12",
    lg: "w-8 h-8 -top-4 -left-2.5 -rotate-12",
    xl: "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 -top-5 sm:-top-6 md:-top-7 lg:-top-8 -left-2 sm:-left-3 md:-left-4 -rotate-[19deg]",
  };

  const ChefHat = () => (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={`absolute ${hatSizes[size]}`}
    >
      <ellipse cx="32" cy="20" rx="22" ry="16" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="2" />
      <circle cx="18" cy="18" r="10" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="2" />
      <circle cx="46" cy="18" r="10" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="2" />
      <circle cx="32" cy="12" r="10" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="2" />
      <rect x="12" y="32" width="40" height="12" rx="2" fill="#FFFFFF" stroke="#e5e5e5" strokeWidth="2" />
    </svg>
  );

  const logoContent = (
    <h1
      className={`${sizeClasses[size]} font-bold ${chewy.className} ${className} relative`}
    >
      <span className="relative inline-block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
        <ChefHat />
        D
      </span>
      <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">id I Cook?</span>
    </h1>
  );

  const content = withAnimation ? (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className="inline-block"
    >
      {logoContent}
    </motion.div>
  ) : (
    <div className="inline-block">{logoContent}</div>
  );

  if (withLink) {
    return <Link href="/">{content}</Link>;
  }

  return content;
}

export default Logo;
