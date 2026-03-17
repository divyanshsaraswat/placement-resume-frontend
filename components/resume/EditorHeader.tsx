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
  view: "code" | "visual";
  onViewChange: (view: "code" | "visual") => void;
  isSaving: boolean;
  onSave: () => void;
  onAIOpen: () => void;
  title: string;
}

export function EditorHeader({ view, onViewChange, isSaving, onSave, onAIOpen, title }: EditorHeaderProps) {
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6 z-50">
      {/* Left Area: Project Title & Back Button */}
      <div className="flex items-center gap-6">
        <Link 
          href="/dashboard/student/resumes"
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <CloudCheck size={20} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-sm font-bold tracking-tight">{title}</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Institutional Template v2.1</span>
          </div>
        </div>
      </div>

      {/* Middle Area: View Switching (Overleaf Style) */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-border/50 shadow-inner">
        <button
          onClick={() => onViewChange("code")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
            view === "code" 
              ? "bg-white dark:bg-slate-800 text-primary shadow-sm shadow-black/5" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Code2 size={14} />
          Code Editor
        </button>
        <button
          onClick={() => onViewChange("visual")}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
            view === "visual" 
              ? "bg-white dark:bg-slate-800 text-primary shadow-sm shadow-black/5" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye size={14} />
          Visual Editor
        </button>
      </div>

      {/* Right Area: Main Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 mr-4 border-r border-border pr-4">
           <button 
             onClick={onSave}
             disabled={isSaving}
             className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
           >
             <Save size={16} strokeWidth={1.5} />
             {isSaving ? "Saving..." : "Auto-saved"}
           </button>
           <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
             <RotateCcw size={16} strokeWidth={1.5} />
           </button>
        </div>

        <div className="flex items-center gap-2">
            <button 
              onClick={onAIOpen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20"
            >
              <Sparkles size={14} />
              AI Review
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 min-w-10 text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-black/10">
              <Download size={14} />
              Download
            </button>
        </div>
      </div>
    </div>
  );
}
