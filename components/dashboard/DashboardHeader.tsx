"use client";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Bell, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 px-8 border-b border-white/5 flex items-center justify-between bg-background/50 backdrop-blur-md sticky top-0 z-40">
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-3 nm-inset px-4 py-2 rounded-2xl w-96 max-w-full">
        <Search size={18} className="text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search resumes, students..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
        />
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        
        <button className="nm-convex p-2.5 rounded-xl text-muted-foreground hover:nm-inset transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{user?.role}</p>
          </div>
          <div className="nm-flat p-1 rounded-full">
            <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User size={20} className="text-muted-foreground" />
               )}
            </div>
          </div>
          <button 
            onClick={logout}
            className="nm-convex p-2.5 rounded-xl text-destructive hover:nm-inset transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
