"use client";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Bell, Search, User, Menu, Settings, ChevronRight, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "Resume Analyzed", description: "Your Software Engineer resume got an 85 score!", time: "2m ago", icon: Sparkles, color: "text-primary" },
    { id: 2, title: "New Feedback", description: "Faculty commented on your latest version.", time: "1h ago", icon: MessageSquare, color: "text-blue-500" },
    { id: 3, title: "System Update", description: "New LaTeX templates are now available.", time: "5h ago", icon: Settings, color: "text-slate-400" },
  ];

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        
        {/* Notifications Popover */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className={cn(
              "p-2 rounded-xl transition-all relative group",
              isNotificationsOpen ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#020617]" />
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-[min(calc(100vw-2rem),380px)] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem] overflow-hidden z-50 p-2"
              >
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">3 New</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                  {notifications.map((n) => (
                    <button key={n.id} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 group">
                      <div className={cn("w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0", n.color)}>
                        <n.icon size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.description}</p>
                        <span className="text-[9px] text-slate-400 mt-1">{n.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="w-full p-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-slate-50 dark:border-slate-800 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  Load More Activity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Popover */}
        <div className="relative flex items-center gap-1" ref={profileRef}>
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 p-1 pl-3 rounded-2xl transition-all group",
              isProfileOpen ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
               {user?.avatar ? (
                 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <User size={18} strokeWidth={1.5} className="text-primary" />
               )}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 p-2"
              >
                <div className="p-3 mb-2 hidden max-sm:block border-b border-slate-50 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{user?.role}</p>
                </div>
                
                <Link 
                  href="/dashboard/settings" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Settings size={16} />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                </Link>

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-all group mt-1"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={16} />
                    <span className="text-sm font-medium">Log out</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
