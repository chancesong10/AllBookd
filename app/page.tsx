"use client";
import React from "react";
import { motion } from "framer-motion";
import { FeatureSection } from "./components/FeatureSection";

/**
 * Landing Page Component
 * * Updated with 100vh Hero height to ensure features are hidden initially.
 */
export default function Page() {
  return (
    <div className="w-full relative bg-zinc-950 selection:bg-white selection:text-black">
      
      {/* 1. FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(/main.jpg)` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* 2. HERO SECTION - Changed to 100vh */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl md:text-9xl font-serif mb-4 text-white tracking-tight text-center">
            AllBookd
          </h1>
          <div className="h-px w-16 bg-white/40 mb-6 mx-auto" />
          <p className="text-xs md:text-sm font-medium text-zinc-300 tracking-[0.4em] uppercase">
            Your personal reading log
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </div>

      {/* 3. SCROLLING CONTENT LAYER */}
      <div className="relative z-20 pb-32 pt-20">
        <div className="space-y-12">
          <FeatureSection 
            index={0}
            title="Share Your Taste"
            description="Connect with fellow book lovers and discover new reads through your friends' recommendations. Explore curated lists and community favorites."
          />
          <FeatureSection 
            index={1}
            title="Keep Track"
            description="Build your personal library and never forget a great book again. Effortlessly organize your history, current reads, and future wishlists."
          />
          <FeatureSection 
            index={2}
            title="Monitor Your Journey"
            description="Track your reading habits, set personal goals, and celebrate your progress with detailed insights and statistics."
          />
        </div>
      </div>
    </div>
  );
}