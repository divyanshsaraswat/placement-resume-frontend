"use client";

import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Variants } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    department: user?.department || "Computer Science",
  });

  const [institutional, setInstitutional] = useState({
    aiProvider: "openrouter",
    compilationTimeout: "30",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Mock API call
    setTimeout(() => {
      toast.success("Settings updated successfully");
      setIsSaving(false);
    }, 1000);
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
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-4">
             <div className="flex items-center gap-3 text-primary">
                <Shield size={18} strokeWidth={1} />
                <span className="text-xs font-bold uppercase tracking-widest">Security Level</span>
             </div>
             <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                You are currently accessing the system with <strong>{user?.role}</strong> privileges. 
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
                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-primary/50 outline-none transition-all text-sm font-light"
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
                      className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-400 text-sm font-light cursor-not-allowed"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Department</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      className="w-full pl-12 pr-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-primary/50 outline-none transition-all text-sm font-light appearance-none"
                    >
                      <option>Computer Science</option>
                      <option>Electronics</option>
                      <option>Mechanical</option>
                      <option>Civil</option>
                    </select>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pl-1">Institutional Role</label>
                  <div className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-primary text-xs font-bold uppercase tracking-widest flex items-center h-[46px] opacity-70">
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
            
            <div className="flex flex-wrap gap-4">
               <button className="flex items-center gap-3 px-6 py-4 rounded-3xl border border-primary/20 bg-primary/5 text-primary transition-all hover:bg-primary/10 group">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                    <Sun size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider">Appearance</p>
                    <p className="text-xs font-light">System Default</p>
                  </div>
               </button>

               <button className="flex items-center gap-3 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all hover:border-primary/30 group">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                    <Bell size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider">Notifications</p>
                    <p className="text-xs font-light">Institutional Alerts On</p>
                  </div>
               </button>
            </div>
          </motion.section>

          {/* Section: Admin Only */}
          {user?.role === "admin" && (
            <motion.section 
              variants={itemVariants} 
              className="p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50 space-y-8 mt-12"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-primary">
                    <Cpu size={24} strokeWidth={1} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Institutional Configuration</h2>
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
                      className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 focus:border-primary outline-none transition-all text-sm font-light appearance-none"
                    >
                      <option value="openrouter">OpenRouter (Optimized)</option>
                      <option value="groq">Groq (LPU Speed)</option>
                    </select>
                    <p className="text-[10px] text-slate-400 px-1 font-light italic">Currently routing via Deepseek-V3 on OpenRouter</p>
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
                         className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 focus:border-primary outline-none transition-all text-sm font-light"
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
                {isSaving ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings size={18} />
                  </motion.div>
                ) : (
                  <Save size={18} />
                )}
                <span className="text-sm">Save All Changes</span>
             </button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
