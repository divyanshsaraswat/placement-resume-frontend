"use client";

import { useAuth } from "@/context/auth-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Bell, Search, User, Menu, Settings, ChevronRight, Sparkles, MessageSquare, Sun, Moon, Send, Cpu, RotateCw } from "lucide-react";
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
  const { user, logout, refreshUser } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, setTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshingCredits, setIsRefreshingCredits] = useState(false);
  
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

    // Real-time notifications via SSE
    let eventSource: EventSource | null = null;
    
    const setupSSE = () => {
      const token = (session as any)?.accessToken;
      if (!token) return;

      // Direct EventSource to the stream endpoint with token
      const url = `/api/v1/notifications/stream?token=${token}`;
      eventSource = new EventSource(url);
      
      eventSource.onmessage = (event) => {
        if (event.data === "update") {
          fetchNotifications();
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Connection error:", err);
        eventSource?.close();
        // Retry after 5 seconds
        setTimeout(setupSSE, 5000);
      };
    };

    setupSSE();

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
      eventSource?.close();
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
  
  const handleRefreshCredits = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isRefreshingCredits) return;
    
    setIsRefreshingCredits(true);
    try {
      await refreshUser();
      // Ensure animation is visible
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (err) {
      console.error("Refresh credits failed:", err);
    } finally {
      setIsRefreshingCredits(false);
    }
  };

  useEffect(() => {
    if (isNotificationsOpen && unreadCount > 0) {
      handleMarkAllRead();
    }
  }, [isNotificationsOpen, unreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resume_approved': return { icon: Sparkles, color: 'text-primary' };
      case 'resume_rejected': return { icon: MessageSquare, color: 'text-rose-500' };
      case 'new_feedback': return { icon: MessageSquare, color: 'text-blue-500' };
      case 'ai_analysis_complete': return { icon: Sparkles, color: 'text-primary' };
      case 'resume_submitted': return { icon: Send, color: 'text-amber-500' };
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
                            // Mark as read
                            if (!n.is_read) {
                              await notificationApi.markAsRead(n._id);
                              setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, is_read: true } : item));
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            }

                            // Navigate based on type and metadata
                            if (n.metadata?.resume_id) {
                              const resumeId = n.metadata.resume_id;
                              if (n.type === 'resume_submitted') {
                                const role = user?.role === 'spc' ? 'spc' : 'faculty';
                                router.push(`/dashboard/${role}/validate/${resumeId}`);
                              } else if (['resume_approved', 'resume_rejected', 'new_feedback'].includes(n.type)) {
                                router.push(`/dashboard/student/resumes/${resumeId}/edit?openReview=true`);
                              }
                            }
                            setIsNotificationsOpen(false);
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
          <div 
            className={cn(
              "flex items-center gap-2 md:gap-3 p-1 rounded-2xl transition-all group",
              isProfileOpen ? "bg-slate-100 dark:bg-slate-800" : ""
            )}
          >
            {user?.llmCredits !== undefined && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary animate-in fade-in slide-in-from-right-2 duration-500 group/pill">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className={cn("shrink-0", isRefreshingCredits && "animate-pulse")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{user.llmCredits}</span>
                </div>
                <button 
                  onClick={handleRefreshCredits}
                  disabled={isRefreshingCredits}
                  className="hover:text-primary/70 transition-colors"
                >
                  <RotateCw size={12} className={cn(isRefreshingCredits && "animate-spin")} />
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 md:gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 p-1 rounded-xl transition-all"
            >
              <div className="text-right hidden md:block leading-tight">
                <p className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-tight">{user?.name || 'Guest User'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-0.5">{user?.role || 'Visitor'}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                 {user?.picture || user?.avatar ? (
                   <img src={user.picture || user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-white dark:bg-slate-950">
                      <User size={20} strokeWidth={1.5} className="text-primary" />
                   </div>
                 )}
              </div>
            </button>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 mt-3 md:w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[1.5rem] overflow-hidden z-50 p-2"
              >
                <div className="p-3 mb-2 hidden max-sm:block border-b border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                      {user?.picture || user?.avatar ? (
                        <img src={user.picture || user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                           <User size={14} className="text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-tight">{user?.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user?.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-3 py-2.5 mb-2 rounded-xl bg-primary/5 border border-primary/10 mx-1">
                   <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-primary">
                        <Cpu size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-primary">{user?.llmCredits || 0} left</span>
                         <button 
                            onClick={handleRefreshCredits}
                            disabled={isRefreshingCredits}
                            className="text-primary/50 hover:text-primary transition-colors"
                         >
                           <RotateCw size={10} className={cn(isRefreshingCredits && "animate-spin")} />
                         </button>
                       </div>
                    </div>
                   <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((user?.llmCredits || 0) / 20) * 100)}%` }}
                        className="h-full bg-primary"
                      />
                   </div>
                   <p className="text-[8px] text-slate-400 mt-1.5 font-medium italic text-right">Refills hourly</p>
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
