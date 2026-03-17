"use client";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Bell, Search, User, Menu } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white dark:bg-[#020617] border-b border-border/50 sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        
        {/* Minimalist Search Icon instead of bar */}
        <button className="p-2 text-slate-300 hover:text-primary transition-colors">
          <Search size={18} strokeWidth={1} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button className="p-2 text-slate-300 hover:text-primary transition-colors relative">
          <Bell size={18} strokeWidth={1} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-4 pl-4 border-l border-slate-50 dark:border-slate-900">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{user?.name}</p>
            <p className="text-[10px] text-slate-400 font-light">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900">
             {user?.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             ) : (
               <User size={16} strokeWidth={1} className="text-slate-300" />
             )}
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} strokeWidth={1} />
          </button>
        </div>
      </div>
    </header>
  );
}
