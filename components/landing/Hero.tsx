"use client";

import { motion, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, GraduationCap, FileText, Shield } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    },
  };

  const dashboardPath = "dashboard.webp"; // Generated path

  return (
    <section className="relative min-h-screen pt-44 pb-20 flex flex-col justify-center items-center">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-12"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="px-4 py-1 rounded-full border border-slate-50 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50 text-primary text-[10px] font-medium tracking-widest uppercase">
              MNIT Intelligence v2.0
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tight leading-[1] max-w-4xl text-slate-800 dark:text-slate-100 px-4"
          >
            Refined document <br />
            <span className="text-primary/70">Intelligence.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants} 
            className="max-w-xl text-base md:text-lg text-slate-400 font-light leading-relaxed px-6"
          >
            An institutional ecosystem engineered for technical precision. 
            AI-validated resumes for the next generation of engineers.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pt-4">
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-full text-sm font-medium hover:scale-[1.02] transition-all text-center"
            >
              Get Started
            </Link>
            <Link 
              href="/demo"
              className="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
            >
              View Demo →
            </Link>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-5xl mt-24 relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1">
               <motion.div 
                 className="rounded-2xl overflow-hidden"
                 whileHover={{ scale: 1.005 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
               >
                 <img 
                   src={dashboardPath} 
                   alt="Placement Dashboard" 
                   className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                 />
               </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Institutional Banner */}
      <div className="mt-32 w-full max-w-4xl mx-auto px-6">
         <div className="flex flex-wrap justify-center sm:justify-between items-center gap-x-12 gap-y-8 opacity-60 text-[10px] uppercase tracking-[0.4em] font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2"><GraduationCap size={16} strokeWidth={1} /> MNIT JAIPUR</div>
            <div className="flex items-center gap-2"><Shield size={16} strokeWidth={1} /> PLACEMENT CELL</div>
            <div className="flex items-center gap-2"><FileText size={16} strokeWidth={1} /> CAREER SERVICES</div>
         </div>
      </div>
    </section>
  );
}
