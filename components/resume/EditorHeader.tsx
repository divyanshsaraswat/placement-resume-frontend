"use client";

import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Code2, 
  Eye, 
  Save, 
  Download, 
  Sparkles,
  CloudCheck,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  onAIOpen: () => void;
  onReload?: () => void;
  onDownload?: () => void;
  title: string;
}

export function EditorHeader({ 
  isSaving, 
  onSave, 
  onAIOpen, 
  onReload,
  onDownload,
  title
}: EditorHeaderProps) {
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6 z-50">
      {/* Left Area: Project Title & Back Button */}
      <div className="flex items-center gap-2 md:gap-6">
        <Link 
          href="/dashboard/student/resumes"
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-primary hidden sm:block">
            <CloudCheck size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col -space-y-0.5 max-w-[150px] sm:max-w-none">
            <span className="text-sm font-bold tracking-tight truncate">{title}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:block">Institutional LaTeX Editor</span>
          </div>
        </div>
      </div>



      {/* Right Area: Main Actions */}
      <div className="flex items-center gap-2 md:gap-4 font-mono">
        <div className="flex items-center gap-1 sm:mr-4 sm:border-r border-border sm:pr-4">
           <button 
             onClick={onSave}
             disabled={isSaving}
             className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
           >
             <Save size={16} strokeWidth={1.5} />
             <span className="hidden lg:inline">{isSaving ? "Saving..." : "Auto-saved"}</span>
           </button>
           <button 
             onClick={onReload}
             className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hidden sm:block"
             title="Reload from Cloud"
           >
             <RotateCcw size={16} strokeWidth={1.5} />
           </button>
        </div>

        <div className="flex items-center gap-2">
            <button 
              onClick={onAIOpen}
              className="flex items-center justify-center sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20"
              title="AI Review"
            >
              <Sparkles size={14} />
              <span className="hidden md:inline">AI Review</span>
            </button>
            <button 
              onClick={onDownload}
              className="flex items-center justify-center sm:gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 min-w-10 text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-black/10"
            >
              <Download size={14} />
              <span className="hidden md:inline">Download</span>
            </button>
        </div>
      </div>
    </div>
  );
}
