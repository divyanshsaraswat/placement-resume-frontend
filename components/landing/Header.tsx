"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
    >
      <div className="nm-pill bg-background px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="nm-flat bg-background p-1.5 sm:p-2 rounded-xl text-primary">
            <Sparkles size={18} className="sm:size-5" />
          </div>
          <span className="text-sm sm:text-lg font-display font-semibold tracking-tight text-primary whitespace-nowrap">MNIT Intelligence</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-muted-foreground/80">
          <Link href="#features" className="hover:text-primary transition-colors">Aesthetics</Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">Intelligence</Link>
          <Link href="#faq" className="hover:text-primary transition-colors">Queries</Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link 
            href="/login" 
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary/70 hover:nm-inset rounded-full transition-all"
          >
            Auth
          </Link>
          <Link 
            href="/login"
            className="nm-primary rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
