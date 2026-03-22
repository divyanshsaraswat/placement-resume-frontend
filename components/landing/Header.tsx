"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl px-4"
    >
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-2 md:gap-4 border border-slate-50 dark:border-slate-900 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md rounded-full">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Platform", "Features",  "Institutional","Security"].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/login"
            className="px-5 py-2 bg-primary text-white rounded-full text-[10px] font-semibold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/25"
          >
            Sign in
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
