"use client";

import { useAuth } from "@/context/auth-context";
import { mockResumes } from "@/types/resume";
import { FileText, Plus, Search, Filter, MoreVertical, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudentResumesPage() {
  const { user } = useAuth();
  const resumes = mockResumes[0].versions; // Mock user's resumes

  const statusColors = {
    approved: "text-emerald-500 bg-emerald-500/10",
    submitted: "text-amber-500 bg-amber-500/10",
    rejected: "text-rose-500 bg-rose-500/10",
    draft: "text-slate-500 bg-slate-500/10",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-primary">Resume Pipeline</h1>
          <p className="text-muted-foreground font-light">Manage your multiple resume versions and track validation progress.</p>
        </div>
        <button className="nm-primary h-14 px-8 rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-xl">
          <Plus size={20} />
          <span>New Resume</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 nm-inset px-6 py-3 rounded-2xl flex items-center gap-4">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search resumes..." 
            className="bg-transparent border-none outline-none w-full text-sm"
          />
        </div>
        <div className="flex gap-4">
           <button className="nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm text-muted-foreground hover:nm-inset transition-all">
             <Filter size={18} />
             Filter
           </button>
        </div>
      </div>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resumes.map((resume, i) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="nm-flat p-8 rounded-[2.5rem] group hover:nm-convex transition-all cursor-pointer relative border border-white/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="nm-inset p-3 rounded-2xl text-primary">
                <FileText size={24} />
              </div>
              <button className="text-muted-foreground/30 hover:text-primary transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">{resume.type}</h3>
                <span className={cn(
                  "inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
                  statusColors[resume.status]
                )}>
                  {resume.status}
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">AI Score</p>
                  <p className="text-2xl font-display font-medium text-primary">
                    {resume.score > 0 ? `${resume.score}%` : "---"}
                  </p>
                </div>
                <div className="nm-inset px-4 py-2 rounded-xl text-[10px] font-bold text-muted-foreground/50">
                   EDIT .TEX
                </div>
              </div>
            </div>

            <div className="absolute inset-x-8 bottom-8 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
               <div className="flex gap-2">
                 <button className="flex-1 nm-convex h-10 rounded-xl text-xs font-medium text-primary flex items-center justify-center gap-2 hover:nm-inset transition-all">
                   Preview <ExternalLink size={12} />
                 </button>
               </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Card Slot */}
        <div className="nm-inset p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-muted-foreground/20 border-2 border-dashed border-white/5 hover:border-primary/20 hover:text-primary/40 transition-all cursor-pointer">
           <Plus size={48} strokeWidth={1} />
           <p className="font-medium">Create Resume Version</p>
        </div>
      </div>
    </div>
  );
}
