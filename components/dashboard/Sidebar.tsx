"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { dashboardNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = dashboardNavItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 84 : 280,
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "h-screen fixed lg:sticky top-0 left-0 flex flex-col z-[70] bg-white dark:bg-[#020617] border-r border-border shadow-2xl lg:shadow-none",
          !isOpen && "hidden lg:flex"
        )}
      >
      {/* Sidebar Header */}
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 text-primary">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Sparkles size={20} strokeWidth={1} />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold tracking-tight text-xl text-foreground"
            >
              Matrix
            </motion.span>
          )}
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="p-2 -mr-2 text-slate-400 hover:text-primary transition-colors lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1.5 pt-10">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} title={item.title} onClick={onClose}>
              <div 
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group relative",
                  isActive 
                    ? "bg-slate-50 dark:bg-slate-900 text-primary font-medium" 
                    : "text-slate-400 hover:text-foreground hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1} className={cn("shrink-0", isActive && "text-primary")} />
                {!isCollapsed && (
                  <span className="text-sm tracking-tight truncate">{item.title}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Toggle - Strictly desktop only (2xl+) */}
      <div className="p-6 mt-auto hidden 2xl:block">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-11 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 transition-all hover:bg-primary/10 hover:text-primary flex items-center justify-center text-slate-400 dark:text-slate-500 group border border-transparent hover:border-primary/20"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  </>
  );
}
