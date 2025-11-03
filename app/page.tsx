"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

export default function Page() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "0%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const maskY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);

  const section1Opacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);
  const section1Y = useTransform(scrollYProgress, [0.05, 0.2], ["50px", "0px"]);

  const section2Opacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const section2Y = useTransform(scrollYProgress, [0.3, 0.4], ["50px", "0px"]);

  const section3Opacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const section3Y = useTransform(scrollYProgress, [0.5, 0.6], ["50px", "0px"]);

  const section4Opacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const section4Y = useTransform(scrollYProgress, [0.7, 0.8], ["50px", "0px"]);

  return (
    <div ref={ref} className="w-full min-h-[300vh] relative">
      <div className="h-screen sticky top-0 overflow-hidden">
        <motion.div
          style={{ y: textY }}
          className="relative z-40 h-full flex flex-col items-center justify-center text-center"
        >
          <h1 
            style={{fontFamily: 'Playfair Display', fontSize: '5rem'}} 
            className="mb-5 text-white"
          >
            AllBookd
          </h1>
          <h2 className="text-2xl font-bold text-white">
            Keep Track of Books You Love
            <br />
            Share Your Taste With Your Friends
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Your personal reading log, reimagined.
          </p>
        </motion.div>

        {/* Main background image - adjust top to account for navbar */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(/main.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: backgroundY,
            top: '80px',
            height: 'calc(100vh - 80px)', 
          }}
        />
        
        {/* Mask image - adjust top to account for navbar */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{
            backgroundImage: `url(/mask.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            y: maskY,
            top: '80px',
            height: 'calc(100vh - 80px)', 
          }}
        />
      </div>

      {/* Content Sections - Reveal sequentially as you scroll */}
      <div className="relative z-30 bg-black">
        {/* Section 1 */}
        <motion.section 
          style={{ opacity: section1Opacity, y: section1Y }}
          className="min-h-screen flex items-center justify-center text-white py-20"
        >
          <div className="text-center max-w-4xl mx-auto px-4">
            <h3 className="text-4xl font-bold mb-8">Share Your Taste With Your Friends</h3>
            <p className="text-xl text-gray-300">
              Connect with fellow book lovers and discover new reads through your friends' recommendations. 
              Share your reading lists and see what others are enjoying.
            </p>
          </div>
        </motion.section>

        {/* Section 2 */}
        <motion.section 
          style={{ opacity: section2Opacity, y: section2Y }}
          className="min-h-screen flex items-center justify-center text-white py-20"
        >
          <div className="text-center max-w-4xl mx-auto px-4">
            <h3 className="text-4xl font-bold mb-8">Keep Track of Books You Love</h3>
            <p className="text-xl text-gray-300">
              Build your personal library and never forget a great book again. 
              Organize your reading history and create wishlists for future adventures.
            </p>
          </div>
        </motion.section>

        {/* Section 3 */}
        <motion.section 
          style={{ opacity: section3Opacity, y: section3Y }}
          className="min-h-screen flex items-center justify-center text-white py-20"
        >
          <div className="text-center max-w-4xl mx-auto px-4">
            <h3 className="text-4xl font-bold mb-8">Connect With Your Community</h3>
            <p className="text-xl text-gray-300">
              Join reading groups, participate in discussions, and share your thoughts 
              on the books that move you. Find your next favorite read through community insights.
            </p>
          </div>
        </motion.section>

        {/* Section 4 */}
        <motion.section 
          style={{ opacity: section4Opacity, y: section4Y }}
          className="min-h-screen flex items-center justify-center text-white py-20"
        >
          <div className="text-center max-w-4xl mx-auto px-4">
            <h3 className="text-4xl font-bold mb-8">Monitor Your Reading Journey</h3>
            <p className="text-xl text-gray-300">
              Track your reading habits, set personal goals, and celebrate your progress. 
              Watch your reading journey unfold with detailed insights and statistics.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}