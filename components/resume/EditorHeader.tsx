"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { 
  ChevronLeft, 
  Code2, 
  Eye, 
  Save, 
  Download, 
  Sparkles,
  CloudCheck,
  RotateCcw,
  Loader2,
  Play,
  Send,
  CheckCircle,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onBack: () => void;
  onAIOpen: () => void;
  onDownload?: () => void;
  title: string;
  status?: string;
  onShowRemark?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function EditorHeader({ 
  isSaving, 
  hasUnsavedChanges,
  onSave, 
  onBack,
  onAIOpen, 
  onDownload,
  title,
  status,
  onShowRemark,
  onSubmit,
  isSubmitting
}: EditorHeaderProps) {
  const { user } = useAuth();
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-3 md:px-6 z-50">
      {/* Left Area: Project Title & Back Button */}
      <div className="flex items-center gap-1.5 md:gap-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-primary hidden sm:block">
            <CloudCheck size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col -space-y-0.5 max-w-[150px] sm:max-w-none">
            <span className="text-sm font-bold tracking-tight truncate flex items-center gap-2">
              {title}
              {status && status !== 'draft' && (
                <button 
                  onClick={(status === 'approved' || status === 'rejected') ? onShowRemark : undefined}
                  className={cn(
                    "flex items-center justify-center rounded-lg font-bold transition-all",
                    status === 'approved' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                    status === 'rejected' ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" :
                    "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                    (status === 'approved' || status === 'rejected') && onShowRemark ? "hover:opacity-80 transition-opacity cursor-pointer" : "cursor-default select-none",
                    "px-1.5 py-1 md:px-2 md:py-0.5"
                  )}
                >
                  <span className="hidden md:block text-[9px] uppercase tracking-widest">{status}</span>
                  <div className="md:hidden">
                    {status === 'approved' ? <CheckCircle size={14} /> : 
                     status === 'rejected' ? <X size={14} /> : 
                     <Loader2 size={14} className="animate-spin opacity-50" />}
                  </div>
                </button>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:block">Institutional LaTeX Editor</span>
          </div>
        </div>
      </div>
      {/* Right Area: Main Actions */}
      <div className="flex items-center gap-1.5 md:gap-4 font-mono">
        <div className="flex items-center gap-1 sm:mr-2 md:mr-4 sm:border-r border-border sm:pr-2 md:pr-4">
           <button 
             onClick={onSave}
             disabled={isSaving || status === 'approved'}
             className={cn(
               "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all",
               status === 'approved'
                 ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
                 : hasUnsavedChanges 
                   ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                   : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
             )}
           >
             <Save size={16} strokeWidth={hasUnsavedChanges && status !== 'approved' ? 2 : 1.5} className={cn(isSaving ? "animate-spin" : "")} />
             <span className="hidden lg:inline">
               {isSaving ? "Saving..." : status === 'approved' ? "Verified" : hasUnsavedChanges ? "Save Changes" : "Changes Saved"}
             </span>
           </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
            <button 
              onClick={onSubmit}
              disabled={isSubmitting || status === 'submitted' || status === 'approved'}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-xs font-bold transition-all border shadow-sm",
                (status === 'submitted' || status === 'approved')
                  ? "bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-100 dark:border-slate-800"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              title={status === 'submitted' ? "Already submitted for review" : "Submit for Institutional Review"}
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin text-primary" /> : <Send size={14} className={cn(status === 'draft' || status === 'rejected' ? "text-primary" : "")} />}
              <span className="hidden sm:inline">
                {status === 'submitted' ? "Under Review" : status === 'approved' ? "Verified" : "Submit Review"}
              </span>
            </button>
            <button 
              onClick={onAIOpen}
              disabled={(user?.llmCredits !== undefined && user.llmCredits <= 0)}
              className={cn(
                "flex items-center justify-center sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all border",
                (user?.llmCredits !== undefined && user.llmCredits <= 0)
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              )}
              title={(user?.llmCredits !== undefined && user.llmCredits <= 0) ? "Insufficient credits" : "AI Review"}
            >
              <Sparkles size={14} className={cn((user?.llmCredits !== undefined && user.llmCredits <= 0) ? "opacity-50" : "animate-pulse")} />
              <span className="hidden sm:inline">AI Review</span>
            </button>
            <button 
              onClick={onDownload}
              className="flex items-center justify-center sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 min-w-10 text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-black/10"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
        </div>
      </div>
    </div>
  );
}
