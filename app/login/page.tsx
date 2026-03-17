"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login initiation failed:", err);
      toast.error("Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,_var(--primary-05)_0%,_transparent_70%)] opacity-20" />
      
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8"
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <div className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors">
            <ArrowLeft size={14} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">Back to Home</span>
        </Link>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-2">
            <Sparkles size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-display">MNIT Intel</h1>
          <p className="text-muted-foreground font-light text-sm">Institutional Placement ERP Integration</p>
        </div>

        <div className="glass p-10 rounded-[2.5rem] shadow-xl space-y-8 flex flex-col items-center text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Portal Access</h2>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest leading-relaxed">Official Academic Network</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-[1.02] group shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Sign in with Google</span>
          </button>
          
          <div className="pt-6 border-t border-border/50 w-full text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
               <ShieldCheck size={14} />
               <p className="text-[10px] text-primary/80 uppercase tracking-widest font-bold">
                 Verified institutional login required
               </p>
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-2 font-medium">Restricted to @mnit.ac.in domain</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground/30 font-medium uppercase tracking-[0.3em]">
            MNIT JAIPUR • PLACEMENT CELL
          </p>
        </div>
      </motion.div>
    </div>
  );
}
