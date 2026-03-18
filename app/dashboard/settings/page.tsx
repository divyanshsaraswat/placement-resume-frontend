"use client";

import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Cpu,
  Save,
  Moon,
  Sun,
  AtSign,
  Building2,
  Sparkles,
  Monitor,
  Check,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Variants } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { adminApi } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    department: user?.department || "Computer Science",
  });

  const [notifications, setNotifications] = useState(true);

  const [institutional, setInstitutional] = useState({
    aiProvider: "openrouter",
    compilationTimeout: "30",
  });

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (user) {
      setProfile({
        name: user.name,
        department: user.department || "Computer Science"
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await adminApi.updateUser(user.id, {
        name: profile.name,
        department: profile.department
      });
      
      await refreshUser();
      toast.success("Profile synchronized with institutional records");
    } catch (err) {
      toast.error("Cloud synchronization failed. Please check connectivity.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (!mounted) return null;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto space-y-12 pb-20"
    >
      {/* Header Area */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-light">
          Manage your account preferences and institutional configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Navigation / Side Info */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80">Account Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Your identity is managed via Institutional SSO. Some fields are controlled by MNIT ERP.
            </p>
          </div>
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
             <div className="flex items-center gap-3 text-primary">
                <Shield size={18} strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-widest">Security Level</span>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                You are currently accessing the system with <span className="text-primary font-bold uppercase">{user?.role}</span> privileges. 
                System-wide audit logs are active for all actions.
             </p>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="md:col-span-2 space-y-12">
          
          {/* Section: Profile */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User size={18} className="text-slate-400" strokeWidth={1.5} />
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Personal Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-5 py-3 bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 dark:text-white rounded-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Email Address</label>
                  <div className="relative group">
                    <AtSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email" 
                      value={user?.email || ""} 
                      readOnly
                      className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-400 text-sm font-light cursor-not-allowed"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Department</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <select 
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      className="w-full pl-12 pr-10 py-3 bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 dark:text-white appearance-none rounded-none cursor-pointer"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Institutional Role</label>
                  <div className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-primary text-[10px] font-bold uppercase tracking-[0.2em] flex items-center h-[46px] opacity-70">
                    {user?.role}
                  </div>
               </div>
            </div>
          </motion.section>

          {/* Section: Interface */}
          <motion.section variants={itemVariants} className="space-y-6 pt-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Settings size={18} className="text-slate-400" strokeWidth={1.5} />
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Display Appearance</label>
                 <div className="flex p-1.5 bg-slate-50 dark:bg-slate-900/80 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all",
                        theme === "light" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Sun size={12} /> Light
                    </button>
                    <button 
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all",
                        theme === "dark" ? "bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <Moon size={12} /> Dark
                    </button>
                    <button 
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all",
                        theme === "system" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                    >
                      <Monitor size={12} /> System
                    </button>
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Institutional Alerts</label>
                 <button 
                    onClick={() => setNotifications(!notifications)}
                    className={cn(
                      "w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] border transition-all group",
                      notifications 
                        ? "border-primary/20 bg-primary/5 text-primary" 
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400"
                    )}
                 >
                    <div className="flex items-center gap-3 text-left">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        notifications ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-50 dark:bg-slate-900"
                      )}>
                        <Bell size={14} className={cn(notifications && "animate-ring")} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider">Notifications</p>
                        <p className="text-xs font-medium">{notifications ? "Alerts Active" : "Alerts Silenced"}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      notifications ? "border-primary bg-primary text-white" : "border-slate-200"
                    )}>
                      {notifications && <Check size={10} strokeWidth={3} />}
                    </div>
                 </button>
               </div>
            </div>
          </motion.section>

          {/* Section: Admin Only */}
          {user?.role === "admin" && (
            <motion.section 
              variants={itemVariants} 
              className="p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50 space-y-8 mt-12 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-primary">
                    <Cpu size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Institutional Configuration</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">Admin Control Plane</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <Sparkles size={12} /> AI Intelligence Node
                    </label>
                    <select 
                      value={institutional.aiProvider}
                      onChange={(e) => setInstitutional({...institutional, aiProvider: e.target.value})}
                      className="w-full px-5 py-3.5 bg-transparent border-0 border-b-2 border-indigo-200 dark:border-indigo-900 focus:border-primary outline-none transition-all text-sm font-medium appearance-none rounded-none cursor-pointer"
                    >
                      <option value="openrouter">OpenRouter (Optimized)</option>
                      <option value="groq">Groq (LPU Speed)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 px-1 font-medium italic">Currently routing via Deepseek-V3 on OpenRouter</p>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <Database size={12} /> Compilation Timeout
                    </label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={institutional.compilationTimeout}
                         onChange={(e) => setInstitutional({...institutional, compilationTimeout: e.target.value})}
                         className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 focus:border-primary outline-none transition-all text-sm font-medium"
                       />
                       <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">seconds</span>
                    </div>
                 </div>
              </div>
            </motion.section>
          )}

          {/* Action Footer */}
          <motion.div variants={itemVariants} className="pt-8 flex items-center justify-end">
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10 group"
             >
                <AnimatePresence mode="wait">
                  {isSaving ? (
                    <motion.div 
                      key="saving"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                    >
                      <Loader2 size={18} className="animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="save"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Save size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="text-sm">Save All Changes</span>
             </button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
