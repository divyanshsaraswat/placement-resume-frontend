"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl px-4"
    >
      <div className="px-8 py-3 flex items-center justify-between gap-4 border border-slate-50 dark:border-slate-900 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md rounded-full">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="text-primary">
            <Sparkles size={18} strokeWidth={1} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">Matrix</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {["Platform", "Features", "Security", "Institutional"].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link 
            href="/login"
            className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link 
            href="/login"
            className="px-5 py-2 bg-primary text-white rounded-full text-[10px] font-semibold uppercase tracking-widest hover:scale-[1.02] transition-all"
          >
            Join
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
