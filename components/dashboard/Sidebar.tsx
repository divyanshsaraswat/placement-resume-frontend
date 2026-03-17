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
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="h-screen sticky top-0 bg-background border-r border-white/5 flex flex-col transition-all duration-300"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-primary"
          >
            <div className="nm-flat p-2 rounded-xl">
              <Sparkles size={20} />
            </div>
            <span className="font-display font-semibold tracking-tight text-lg">MNIT ERP</span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="nm-flat p-2 rounded-xl text-primary mx-auto">
            <Sparkles size={20} />
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-4 pt-6">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} title={item.title}>
              <div 
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group",
                  isActive 
                    ? "nm-inset text-primary" 
                    : "hover:nm-convex text-muted-foreground hover:text-primary"
                )}
              >
                <Icon size={20} className={cn("shrink-0", isActive && "text-primary")} />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">{item.title}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full nm-convex p-3 rounded-2xl text-muted-foreground hover:nm-inset transition-all flex items-center justify-center"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
