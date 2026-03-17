"use client";

import { motion, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Feather, Shield, Zap } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" }
    },
  };

  return (
    <section className="relative min-h-[85vh] pt-20 sm:pt-28 pb-12 sm:pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full text-center space-y-8 sm:space-y-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="flex justify-center">
          <Badge variant="outline" className="nm-flat px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-none bg-background text-primary gap-2 font-medium tracking-wide text-[10px] sm:text-xs">
            <Feather size={12} className="text-primary/60 sm:size-3.5" />
            <span className="text-primary/80">Neumorphic Intelligence for Placement</span>
          </Badge>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-display font-light tracking-tight leading-[1.1] text-balance mb-4 sm:mb-6 text-soft-glow"
        >
          Drafting the <br />
          <span className="font-semibold text-primary">Future of Career</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="max-w-3xl mx-auto text-base sm:text-lg md:text-2xl text-muted-foreground font-light leading-relaxed tracking-tight px-4 opacity-80"
        >
          Elevate your professional narrative with a tactile, soft, and high-performance placement ecosystem. AI-crafted LaTeX resumes with a touch of modern luxury.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6">
          <Link 
            href="/login"
            className="w-full sm:w-auto nm-primary h-14 sm:h-16 px-10 sm:px-12 rounded-full text-base sm:text-lg transition-all group inline-flex items-center justify-center"
          >
            Start Your Journey
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="#features"
            className="w-full sm:w-auto nm-convex bg-background text-primary h-14 sm:h-16 px-10 sm:px-12 rounded-full text-base sm:text-lg font-medium hover:nm-inset transition-all inline-flex items-center justify-center border border-primary/10"
          >
            Explore Aesthetics
          </Link>
        </motion.div>
      </motion.div>

      {/* Neumorphic Feature Bits */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12 max-w-6xl w-full px-4"
      >
        {[
          { icon: Zap, label: "Instant Reasoning", sub: "Llama-3 powered logic" },
          { icon: Shield, label: "Vault Security", sub: "MNIT Domain SSO Protected" },
          { icon: Sparkles, label: "Tactile LaTeX", sub: "Premium document authorship" }
        ].map((item, i) => (
          <div key={i} className="nm-flat bg-background p-6 rounded-3xl flex flex-col items-center space-y-2 sm:space-y-3 text-center transition-all hover:nm-convex">
            <div className="nm-inset w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background flex items-center justify-center text-primary/60">
              <item.icon size={16} className="sm:size-[18px]" />
            </div>
            <div>
              <p className="font-display font-semibold text-primary/80 tracking-tight text-sm sm:text-base">{item.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground/60">{item.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
