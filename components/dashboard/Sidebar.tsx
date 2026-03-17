"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { dashboardNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredItems = dashboardNavItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 84 : 280 }}
      className="h-screen sticky top-0 flex flex-col transition-all duration-500 z-40 bg-white dark:bg-[#020617]"
    >
      {/* Sidebar Header */}
      <div className="p-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary"
          >
            <div className="bg-primary/10 p-2 rounded-xl">
              <Sparkles size={20} strokeWidth={1} />
            </div>
            <span className="font-semibold tracking-tight text-xl text-foreground">Matrix</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="bg-primary/10 p-2 rounded-xl mx-auto text-primary">
            <Sparkles size={20} strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1.5 pt-10">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} title={item.title}>
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

      {/* Footer Toggle */}
      <div className="p-6 mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-11 rounded-2xl bg-slate-50 dark:bg-slate-900/50 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-slate-500"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
