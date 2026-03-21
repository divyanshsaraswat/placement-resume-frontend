"use client";

import { useAuth } from "@/context/auth-context";
import { LogOut, Bell, Search, User, Menu, Settings, ChevronRight, Sparkles, MessageSquare, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { notificationApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (signal?: AbortSignal) => {
    try {
      setIsFetching(true);
      const [data, countData] = await Promise.all([
        notificationApi.getNotifications(20, signal),
        notificationApi.getUnreadCount(signal)
      ]);
      setNotifications(data);
      setUnreadCount(countData.count);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError' || err.message === 'canceled') {
        return;
      }
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => fetchNotifications(controller.signal), 30000);

    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
      controller.abort();
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resume_approved': return { icon: Sparkles, color: 'text-primary' };
      case 'resume_rejected': return { icon: MessageSquare, color: 'text-rose-500' };
      case 'new_feedback': return { icon: MessageSquare, color: 'text-blue-500' };
      case 'ai_analysis_complete': return { icon: Sparkles, color: 'text-primary' };
      default: return { icon: Bell, color: 'text-slate-400' };
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Sparkles size={16} strokeWidth={1.5} className="text-primary" />
          </div>
          <span className="font-semibold tracking-tight text-base text-foreground">Matrix</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Notifications Popover */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group",
              isNotificationsOpen ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            )}
          >
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#020617]" />
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 mt-3 md:w-[380px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem] overflow-hidden z-50 p-2"
              >
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-wider"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto py-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs text-slate-400">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const { icon: Icon, color } = getNotificationIcon(n.type);
                      return (
                        <button 
                          key={n._id} 
                          onClick={async () => {
                            if (!n.is_read) {
                              await notificationApi.markAsRead(n._id);
                              setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, is_read: true } : item));
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            }
                          }}
                          className={cn(
                            "w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 group relative",
                            !n.is_read && "bg-primary/[0.02] dark:bg-primary/[0.02]"
                          )}
                        >
                          {!n.is_read && (
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                          <div className={cn("w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0", color)}>
                            <Icon size={18} strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <p className={cn(
                              "text-xs font-bold transition-colors group-hover:text-primary",
                              n.is_read ? "text-slate-900 dark:text-white" : "text-primary dark:text-primary-foreground"
                            )}>
                              {n.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">{n.description}</p>
                            <span className="text-[9px] text-slate-400 mt-1">
                              {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : "recently"}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
                {notifications.length > 5 && (
                  <button className="w-full p-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-t border-slate-50 dark:border-slate-800 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    Load More Activity
                  </button>
                )}
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
              "flex items-center gap-3 w-10 h-10 sm:w-auto p-0 sm:p-1 sm:pl-3 rounded-2xl transition-all group justify-center sm:justify-start",
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
                className="fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 mt-3 md:w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 p-2"
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
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-primary transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                </button>

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
