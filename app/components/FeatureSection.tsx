// components/FeatureSection.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";

interface FeatureSectionProps {
  title: string;
  description: string;
  index: number;
}

/**
 * FeatureSection Component
 * Renders a side-by-side feature block that fades and slides in when scrolled into view.
 */
export const FeatureSection = ({ title, description, index }: FeatureSectionProps) => {
  const isEven = index % 2 === 0;
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 flex items-center justify-center text-white px-8"
    >
      <div className={`max-w-4xl w-full flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10`}>
        <div className="flex-1 space-y-3 p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
          <h3 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="flex-1 w-full max-w-sm aspect-video bg-zinc-800/40 backdrop-blur-sm rounded-xl border border-white/5 flex items-center justify-center text-zinc-500 text-[10px] uppercase tracking-widest">
           UI Preview
        </div>
      </div>
    </motion.section>
  );
};