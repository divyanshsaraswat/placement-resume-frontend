"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { FileText, Plus, Search, Filter, MoreVertical, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { resumeApi } from "@/lib/api";
import { CreateResumeDialog } from "@/components/dashboard/CreateResumeDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StudentResumesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchResumes = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await resumeApi.getResumes(signal);
      setResumes(data);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(err);
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchResumes(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, []);

  const handleCreateResume = async (type: string, template: string) => {
    try {
      const newResume = await resumeApi.createResume(type, template);
      toast.success("Resume version initialized!");
      router.push(`/dashboard/student/resumes/${newResume.id || newResume._id}/edit`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create resume");
    }
  };

  const statusColors: Record<string, string> = {
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    submitted: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    draft: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Documents</h1>
          <p className="text-sm text-slate-400 font-light pr-4">Your professional document pipeline and institutional status.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Version</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border-b border-slate-50 dark:border-slate-900 pb-4">
        <div className="flex-1 w-full flex items-center gap-3">
          <Search size={16} className="text-slate-300" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="bg-transparent border-none outline-none w-full text-sm font-light placeholder:text-slate-300"
          />
        </div>
        <button className="w-full sm:w-auto text-sm font-medium text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Resumes Grid */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-slate-200" size={32} />
          <p className="text-xs text-slate-300 font-light">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {resumes.map((resume, i) => {
            const latestVersion = resume.versions[resume.versions.length - 1];
            return (
              <motion.div
                key={resume.id || resume._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer space-y-4"
                onClick={() => router.push(`/dashboard/student/resumes/${resume.id || resume._id}/edit`)}
              >
                <div className="aspect-[3/4] rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 flex flex-col p-8 transition-all group-hover:bg-slate-50 dark:group-hover:bg-slate-900 relative">
                  <div className="flex justify-between items-start">
                    <div className="text-slate-300 group-hover:text-primary transition-colors">
                      <FileText size={32} strokeWidth={1} />
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest",
                      latestVersion?.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'
                    )}>
                      {latestVersion?.status || "draft"}
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">v.{resume.versions.length}</p>
                    <h3 className="text-lg font-medium leading-tight text-slate-700 dark:text-slate-200">
                      {latestVersion?.type || "Technical Resume"}
                    </h3>
                  </div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 text-slate-300 hover:text-primary">
                        <MoreVertical size={16} />
                     </button>
                  </div>
                </div>
                
                <div className="px-2 flex justify-between items-center text-[11px]">
                   <span className="text-slate-400 font-light">Score: {latestVersion?.ai_score?.total || "--"}</span>
                   <span className="text-slate-300 group-hover:text-primary transition-colors">Edit document →</span>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Card Slot */}
          <motion.div 
            onClick={() => setIsCreateOpen(true)}
            className="aspect-[3/4] rounded-3xl border border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-200 hover:text-primary/40 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
          >
             <Plus size={32} strokeWidth={1} />
             <p className="text-sm font-medium">Add New Document</p>
          </motion.div>
        </div>
      )}

      <CreateResumeDialog 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateResume}
      />
    </div>
  );
}
