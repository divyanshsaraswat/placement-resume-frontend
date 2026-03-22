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
    <section className="relative min-h-screen pt-32 sm:pt-40 pb-20 flex flex-col justify-start items-center overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-7 sm:space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="px-4 py-1.5 rounded-2xl border border-primary/20 dark:border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm text-primary dark:text-primary text-[10px] font-semibold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors hover:bg-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              MNIT Intelligence v2.0
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-bold tracking-tighter leading-[1.05] max-w-5xl text-slate-900 dark:text-white px-2 sm:px-4"
          >
            Refined document <br className="hidden sm:block" />
            <span className="text-primary">intelligence.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants} 
            className="max-w-2xl text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-6 pb-2"
          >
            Featuring an institutional ecosystem engineered for technical precision. 
            AI-validated resumes for the next generation of engineers.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary dark:bg-primary text-white rounded-full text-[15px] font-medium hover:scale-[1.02] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all text-center"
            >
              Get Started
            </Link>
            <Link 
              href="/demo"
              className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-full text-[15px] font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-center flex items-center justify-center gap-2"
            >
              View Demo <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Institutional Branding (Moved up to act as 'Trusted By') */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        className="flex items-center justify-center pt-36 pb-12 px-4 w-full"
      >
        <div className="flex flex-col items-center gap-8 w-full">
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium bg-white/50 dark:bg-slate-950/50 px-4 py-1.5 rounded-full text-center">
            Trusted by placement teams at
          </p>
          <div className="flex items-stretch justify-center gap-4 sm:gap-8 opacity-70 hover:opacity-100 transition-opacity duration-700 w-full max-w-full">
            
            {/* Left Text (Institution) */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="flex flex-col justify-center text-right pr-2 min-w-0"
            >
              <span className="text-[12px] sm:text-[15px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap truncate">
                Institutions
              </span>
            </motion.div>

            {/* Fine Line separator */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, scaleY: 0 },
                visible: { opacity: 1, scaleY: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 } }
              }}
              className="w-px bg-slate-300 dark:bg-slate-700 origin-top shrink-0"
            />

            {/* Right content (MNIT Logo + Text) */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: -20, filter: "blur(4px)" },
                visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 } }
              }}
              className="flex flex-row items-center gap-2.5 sm:gap-4 group/logo cursor-default min-w-0"
            >
              <img 
                src="/mnit.png" 
                alt="MNIT Jaipur Logo" 
                className="h-8 sm:h-10 w-auto object-contain transition-transform duration-700 group-hover/logo:scale-105 shrink-0 grayscale hover:grayscale-0"
              />
              <div className="flex flex-col items-start gap-0.5 sm:gap-1 text-left min-w-0">
                <span className="text-[10px] sm:text-[14px] font-bold uppercase tracking-wider sm:tracking-[0.2em] text-slate-700 dark:text-slate-300 whitespace-nowrap truncate leading-none">
                  MNIT JAIPUR
                </span>
                <span className="text-[7px] sm:text-[9.5px] font-semibold uppercase tracking-wide sm:tracking-[0.1em] text-slate-500 whitespace-nowrap truncate leading-none">
                  Training And Placement Cell
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Dashboard Preview (Massive Bezel Wrapper) */}
      <div className="container mx-auto px-4 relative z-10 w-full max-w-6xl mt-4 sm:mt-10 mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="relative w-full rounded-[2rem] sm:rounded-[3rem] bg-slate-100/50 dark:bg-slate-800/20 p-3 sm:p-6 md:p-8 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
        >
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-800">
             <motion.div 
               whileHover={{ scale: 1.01 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="w-full h-full flex items-start justify-center overflow-hidden"
             >
               <img 
                 src={dashboardPath} 
                 alt="Placement Dashboard" 
                 className="w-full h-auto object-cover object-top filter contrast-[1.02] opacity-95 hover:opacity-100 transition-opacity duration-500 rounded-lg sm:rounded-2xl"
               />
             </motion.div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
