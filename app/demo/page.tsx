"use client";

import { motion } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Header />
      
      <div className="pt-44 pb-20 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-6 text-center lg:text-left">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to system
            </Link>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              Experience the <br />
              <span className="text-primary/70">Matrix Workflow.</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-400 font-light leading-relaxed">
              A brief overview of the AI-driven placement ecosystem engineered for MNIT Jaipur.
            </p>
          </div>

          {/* Video Container */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative group cursor-pointer"
          >
            {/* The Outer Frame */}
            <div className="relative aspect-video rounded-3xl md:rounded-[3rem] overflow-hidden bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 p-1 md:p-2">
              <div className="relative w-full h-full rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-slate-950 flex items-center justify-center">
                {/* Simulated Placeholder Image/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-950 to-secondary/20 opacity-50" />
                
                {/* Play Button Overlay */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all group-hover:bg-primary group-hover:border-primary group-hover:shadow-primary/30"
                >
                  <Play size={32} fill="currentColor" strokeWidth={0} className="ml-1" />
                </motion.div>

                {/* Progress Bar (Visual Only) */}
                <div className="absolute bottom-6 left-6 right-6 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "30%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
          </motion.div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
            {[
              { title: "Smart Matching", desc: "50+ vector parameters for precise placement analysis." },
              { title: "Direct LaTeX", desc: "Bypass generic builders with institutional-grade source code." },
              { title: "Secure Vault", desc: "Data residency within the MNIT infrastructure." }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-primary">{item.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
