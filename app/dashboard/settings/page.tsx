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
import { adminApi, llmApi } from "@/lib/api";

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
    aiProvider: "groq",
    compilationTimeout: "30",
  });

  const [llmInfo, setLlmInfo] = useState<{
    models: Record<string, number>;
    default: string;
    hourly_limit: number;
  } | null>(null);

  const [selectedModel, setSelectedModel] = useState<string>(user?.preferredModel || "");

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (user) {
      setProfile({
        name: user.name,
        department: user.department || "Computer Science"
      });
      setSelectedModel(user.preferredModel || "");
    }
    
    const fetchLlmInfo = async () => {
      try {
        const info = await llmApi.getModelsInfo();
        setLlmInfo(info);
        if (!selectedModel && info.default) {
           setSelectedModel(info.default);
        }
      } catch (err) {
        console.error("Failed to fetch LLM info", err);
      }
    };
    fetchLlmInfo();
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      await adminApi.updateUser(user.id, {
        department: profile.department,
        preferred_model: selectedModel
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
                    readOnly
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900/40 border-0 border-b-2 border-slate-100 dark:border-slate-800 text-slate-400 cursor-not-allowed outline-none transition-all text-sm font-medium rounded-none"
                  />
                  <p className="text-[9px] text-slate-400 italic font-medium px-1 pt-1 opacity-60">Identity is managed via Institutional SSO</p>
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
                    <Building2 size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <div className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-400 text-sm font-light flex items-center h-[46px] opacity-70">
                       {profile.department}
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
                  <div className="flex p-1 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800 h-[64px]">
                     <button 
                       onClick={() => setTheme("light")}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                         theme === "light" ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                       <Sun size={12} /> Light
                     </button>
                     <button 
                       onClick={() => setTheme("dark")}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                         theme === "dark" ? "bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-200"
                       )}
                     >
                       <Moon size={12} /> Dark
                     </button>
                     <button 
                       onClick={() => setTheme("system")}
                       className={cn(
                         "flex-1 flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
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
                       "w-full flex items-center justify-between px-5 rounded-2xl border transition-all h-[64px] group",
                       notifications 
                         ? "border-primary/20 bg-primary/5 text-primary" 
                         : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400"
                     )}
                  >
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                         notifications ? "bg-white dark:bg-slate-800 shadow-sm" : "bg-slate-50 dark:bg-slate-900"
                       )}>
                         <Bell size={14} className={cn(notifications && "animate-ring")} />
                       </div>
                      <div className="text-left leading-tight">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">Notifications</p>
                        <p className={cn(
                          "text-xs font-bold",
                          notifications ? "text-primary" : "text-slate-400"
                        )}>
                          {notifications ? "Active" : "Silenced"}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                      notifications ? "bg-primary border-primary text-white" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    )}>
                      {notifications && <Check size={12} strokeWidth={4} />}
                    </div>
                 </button>
               </div>
            </div>
          </motion.section>

          {/* Section: Institutional AI (Unified for all roles) */}
          <motion.section variants={itemVariants} className="space-y-6 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-primary" strokeWidth={1.5} />
                <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Institutional AI Hub</h2>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
                <Cpu size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.llmCredits || 0} / {llmInfo?.hourly_limit || 20} CREDITS</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
              Select your intelligence node. Higher complexity models consume more credits per analysis or chat request.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               {llmInfo?.models && Object.entries(llmInfo.models).map(([model, cost]) => (
                 <button 
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    "flex flex-col gap-3 p-5 rounded-3xl border transition-all text-left relative group overflow-hidden",
                    selectedModel === model 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-950"
                  )}
                 >
                    {selectedModel === model && (
                      <motion.div 
                        layoutId="active-model"
                        className="absolute inset-0 bg-primary/5 pointer-events-none"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="flex justify-between items-start gap-2 relative z-10 w-full">
                      <div className="space-y-1 min-w-0">
                        <p className={cn(
                          "text-xs font-bold truncate",
                          selectedModel === model ? "text-primary" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {model.split('/').pop()?.toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">Institutional AI Node</p>
                      </div>
                      <div className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight whitespace-nowrap",
                        selectedModel === model ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      )}>
                        {cost} Credit{cost > 1 ? 's' : ''}
                      </div>
                    </div>
                 </button>
               ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex gap-4">
               <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Monitor size={14} className="text-amber-600 dark:text-amber-400" />
               </div>
               <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-tight">Credit Information</p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-medium">
                    Credits reset every 60 minutes. High-usage periods might trigger institutional rate limits. 
                    Currently using {selectedModel.split('/').pop()} at {llmInfo?.models?.[selectedModel] || 1} cred/req.
                  </p>
               </div>
            </div>
          </motion.section>


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
