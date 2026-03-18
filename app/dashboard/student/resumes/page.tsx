'use client'
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/auth-context";
import { FileText, Plus, Search, Filter, MoreVertical, ExternalLink, Loader2, FileCode, FilePenLine, Trash2, Send, Download, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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

  useLayoutEffect(() => {
    if (openMenuId && buttonRefs.current[openMenuId]) {
      const rect = buttonRefs.current[openMenuId]!.getBoundingClientRect();
      setMenuPosition({
        top: rect.top + window.scrollY,
        right: window.innerWidth - rect.left - window.scrollX + 8
      });
    } else {
      setMenuPosition(null);
    }
  }, [openMenuId]);

  useEffect(() => {
    const handleClose = () => setOpenMenuId(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, []);

  const handleCreateResume = async (type: string, template: string, format: string, fileUrl?: string) => {
    try {
      const newResume = await resumeApi.createResume(type, template, format, fileUrl);
      toast.success("Resume version initialized!");
      
      if (format === 'latex') {
        router.push(`/dashboard/student/resumes/${newResume.id || newResume._id}/edit`);
      } else {
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create resume");
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume? This cannot be undone.")) return;
    try {
      await resumeApi.deleteResume(id);
      toast.success("Resume deleted");
      fetchResumes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete resume");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleSubmitResume = async (id: string) => {
    try {
      await resumeApi.submitResume(id);
      toast.success("Resume submitted for review!");
      fetchResumes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit resume");
    } finally {
      setOpenMenuId(null);
    }
  };

  const filteredResumes = resumes.filter(resume => {
    const latestVersion = resume.versions[resume.versions.length - 1];
    const matchesSearch = (latestVersion?.type || "Technical Resume")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (latestVersion?.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light pr-4">Your professional document pipeline and institutional status.</p>
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
          <Search size={16} className="text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="bg-transparent w-full text-sm font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-primary transition-all rounded-none border-b border-transparent focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "approved", "submitted", "draft"].map((status) => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                statusFilter === status 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:text-primary"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Resumes Grid */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-slate-200" size={32} />
          <p className="text-xs text-slate-300 font-light">Loading documents...</p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-40 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
          <Search size={48} strokeWidth={0.5} />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">No documents found</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Try adjusting your search or filters</p>
          </div>
          <button 
            onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
            className="mt-4 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
          >
            Clear All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredResumes.map((resume, i) => {
            const resumeId = resume.id || resume._id;
            const latestVersion = resume.versions[resume.versions.length - 1];
            return (
              <motion.div
                key={resumeId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer space-y-4"
                onClick={() => {
                  router.push(`/dashboard/student/resumes/${resumeId}/edit`);
                }}
              >
                <div className="aspect-[4/3] rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col p-8 transition-all group-hover:bg-slate-50 dark:group-hover:bg-slate-900 relative">
                  <div className="flex justify-between items-start">
                    <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors flex items-center gap-3">
                      {latestVersion?.format === 'latex' ? (
                        <FileCode size={32} strokeWidth={1} />
                      ) : (
                        <FileText size={32} strokeWidth={1} />
                      )}
                      {latestVersion?.format && latestVersion.format !== 'latex' && (
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg uppercase tracking-wider text-slate-500">
                          {latestVersion.format}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest",
                      latestVersion?.status === 'approved' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                    )}>
                      {latestVersion?.status || "draft"}
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-1">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">v.{resume.versions.length}</p>
                    <h3 className="text-lg font-medium leading-tight text-slate-800 dark:text-white transition-colors group-hover:text-primary">
                      {latestVersion?.type || "Technical Resume"}
                    </h3>
                  </div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        ref={el => { buttonRefs.current[resumeId] = el; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === resumeId ? null : resumeId);
                        }}
                        className={cn(
                          "p-2 rounded-xl text-slate-300 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all",
                          openMenuId === resumeId && "text-primary bg-white dark:bg-slate-800 shadow-sm opacity-100"
                        )}
                     >
                        <MoreVertical size={18} />
                     </button>
                  </div>
                </div>
                
                <div className="px-2 flex justify-between items-center text-[11px]">
                   <span className="text-slate-500 dark:text-slate-400 font-light">Score: {latestVersion?.ai_score?.total || "--"}</span>
                   <span className="text-primary/70 dark:text-slate-300 group-hover:text-primary transition-colors font-medium text-[10px] font-bold uppercase tracking-widest">
                     {latestVersion?.format === 'latex' ? 'Edit document →' : 'View version →'}
                   </span>
                </div>

                {/* Portal-based Menu */}
                {openMenuId === resumeId && menuPosition && typeof document !== 'undefined' && createPortal(
                  <div className="fixed inset-0 z-[100]" onClick={(e) => e.stopPropagation()}>
                    <div 
                      className="absolute inset-0 bg-transparent" 
                      onClick={() => setOpenMenuId(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      style={{ 
                        position: 'fixed',
                        top: menuPosition.top,
                        right: menuPosition.right,
                      }}
                      className="w-52 bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 text-left"
                    >
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/student/resumes/${resumeId}/edit`);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <FilePenLine size={14} className="text-primary" />
                          <span>View / Edit</span>
                        </button>

                        {(latestVersion?.status === 'draft' || latestVersion?.status === 'rejected') && (
                          <button
                            onClick={() => handleSubmitResume(resumeId)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors"
                          >
                            <Send size={14} />
                            <span>Submit Review</span>
                          </button>
                        )}

                        {latestVersion?.file_url && (
                          <button
                            onClick={() => window.open(latestVersion.file_url, '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download size={14} />
                            <span>Download PDF</span>
                          </button>
                        )}
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                        
                        <button
                          onClick={() => handleDeleteResume(resumeId)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Delete Record</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>,
                  document.body
                )}
              </motion.div>
            );
          })}

          {/* Add New Card Slot */}
          <motion.div 
            onClick={() => setIsCreateOpen(true)}
            className="aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-primary/60 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
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
