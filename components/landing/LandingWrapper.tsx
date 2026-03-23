"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Footer } from "./Footer";

interface LandingWrapperProps {
  children: React.ReactNode;
}

export function LandingWrapper({ children }: LandingWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate radius value (0 to 6.5) based on scroll progress
  // We use a multi-point transform [0.95, 0.98, 1] mapped to [0, 1, 6.5] 
  // to simulate a high-intensity cubic-bezier ramp for that snappy 'wipe'
  const radiusValue = useTransform(
    scrollYProgress, 
    [0.95, 0.98, 1], 
    [0, 1, 6.5]
  );

  // Apply a tighter Spring for high-fidelity response
  const smoothRadius = useSpring(radiusValue, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  // Final radius with units
  const borderRadius = useTransform(smoothRadius, (v) => `${v}rem`);

  return (
    <main className="min-h-screen bg-[#0A0C10]">
      <motion.div 
        ref={containerRef}
        style={{ 
          borderBottomLeftRadius: borderRadius, 
          borderBottomRightRadius: borderRadius 
        }}
        className="bg-white dark:bg-slate-950 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative z-10 pb-8 overflow-hidden"
      >
        {children}
      </motion.div>
      <Footer />
    </main>
  );
}
