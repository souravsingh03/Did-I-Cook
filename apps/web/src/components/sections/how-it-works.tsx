"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CookbookCard } from "@/components/ui";
import { BackgroundPattern, FloatingDecorations } from "@/components/ui";

const howItWorksDecorations = [
  { image: "/fries.png", imageClass: "w-12 h-12", position: "top-16 left-[8%]", opacity: "opacity-20", rotation: "rotate-12", animate: true },
  { image: "/meat.png", imageClass: "w-10 h-10", position: "top-28 right-[12%]", opacity: "opacity-15", rotation: "-rotate-12" },
  { image: "/microphone.png", imageClass: "w-10 h-10", position: "bottom-20 left-[10%]", opacity: "opacity-15", rotation: "rotate-6" },
  { image: "/speaking.png", imageClass: "w-10 h-10", position: "bottom-12 right-[5%]", opacity: "opacity-15", rotation: "-rotate-6", animate: true },
];

const steps = [
  {
    step: 1,
    title: "Pick a Topic",
    subtitle: "The Appetizer",
    colorScheme: "red" as const,
    ingredients: [
      "Choose from fun debate topics",
      'Or pick "Random" for a surprise',
      "Topics range from silly to serious",
      "Share with a friend to compete!",
    ],
  },
  {
    step: 2,
    title: "Make Your Case",
    subtitle: "The Main Course",
    colorScheme: "orange" as const,
    ingredients: [
      "Take turns making arguments",
      "Be logical and clear",
      "Use evidence when you can",
      "Stay civil - keep it friendly!",
    ],
  },
  {
    step: 3,
    title: "Get Scored",
    subtitle: "The Dessert",
    colorScheme: "yellow" as const,
    ingredients: [
      "AI judges each argument",
      "Scored on logic & clarity",
      "Points for good evidence",
      "Winner = best debater!",
    ],
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="w-full py-20 bg-gradient-to-b from-amber-50/80 via-amber-50/50 to-white relative overflow-hidden">
      <BackgroundPattern imageUrl="/ForkKnife.png" />
      <FloatingDecorations decorations={howItWorksDecorations} />
      
      <div ref={ref} className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent pb-3">
            How It Works
          </h2>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-orange-400" />
            <div className="w-2 h-2 rotate-45 bg-orange-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-orange-400" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: "easeOut" }}
            >
              <CookbookCard {...step} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
