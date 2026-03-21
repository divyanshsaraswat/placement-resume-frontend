'use client'
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/auth-context";
import { FileText, Plus, Search, Filter, MoreVertical, ExternalLink, Loader2, FileCode, FilePenLine, Trash2, Trash, Send, Download, CheckCircle, Upload, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { resumeApi } from "@/lib/api";
import { CreateResumeDialog } from "@/components/dashboard/CreateResumeDialog";
import { AddVersionDialog } from "@/components/dashboard/AddVersionDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StudentResumesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [versionDialogResume, setVersionDialogResume] = useState<{ id: string; format: string; type: string } | null>(null);
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

  const handleCreateResume = async (type: string, template: string, format: string, file?: File) => {
    try {
      // Safety: Force format if file extension suggests otherwise
      let finalFormat = format;
      if (file) {
        if (file.name.toLowerCase().endsWith('.pdf')) finalFormat = 'pdf';
        else if (file.name.toLowerCase().endsWith('.docx')) finalFormat = 'docx';
      }
      
      console.log(`[ResumeCreate] Initializing ${type} in ${finalFormat} format`, { hasFile: !!file });
      
      if (finalFormat !== 'latex' && !file) {
        throw new Error(`A ${finalFormat.toUpperCase()} file is required for this strategy.`);
      }

      const newResume = await resumeApi.createResume(type, template, finalFormat, file);
      toast.success("Resume created successfully!");
      
      if (finalFormat === 'latex') {
        router.push(`/dashboard/student/resumes/${newResume.id || newResume._id}/edit`);
      } else {
        fetchResumes();
      }
    } catch (err: any) {
      console.error("[ResumeCreate Error]", err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : "Failed to create resume");
      toast.error(errorMsg);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entire document and all its versions? This cannot be undone.")) return;
    
    setOpenMenuId(null);
    toast.promise(resumeApi.deleteResume(id), {
      loading: 'Deleting document portfolio...',
      success: () => {
        fetchResumes();
        return 'Document portfolio permanently deleted';
      },
      error: (err: any) => err?.response?.data?.detail || 'Failed to delete document',
    });
  };

  const handleDeleteVersion = async (resumeId: string, versionId: string) => {
    if (!confirm("Are you sure you want to delete this specific version?")) return;
    
    setOpenMenuId(null);
    toast.promise(resumeApi.deleteVersion(resumeId, versionId), {
      loading: 'Deleting record iteration...',
      success: () => {
        fetchResumes();
        return 'Iterative record deleted successfully';
      },
      error: (err: any) => err?.response?.data?.detail || 'Failed to delete version',
    });
  };

  const handleSubmitResume = async (id: string) => {
    setOpenMenuId(null);
    toast.promise(resumeApi.submitResume(id), {
      loading: 'Initializing review protocols...',
      success: () => {
        fetchResumes();
        return 'Document successfully submitted to verification queue';
      },
      error: (err: any) => err?.response?.data?.detail || 'Failed to submit document',
    });
  };

  const handleAddVersion = async (resumeId: string, type: string, latexCode: string, format: string, file?: File) => {
    toast.promise(resumeApi.addVersion(resumeId, type, latexCode, format, file), {
      loading: `Uploading new ${format.toUpperCase()} record...`,
      success: () => {
        fetchResumes();
        return 'New iterative record successfully verified';
      },
      error: (err: any) => err?.response?.data?.detail || 'Failed to establish new record version',
    });
  };

  const allVersionCards = resumes.flatMap(resume => 
    resume.versions.map((version: any, index: number) => ({
      ...version,
      resumeId: resume.id || resume._id,
      versionIndex: index + 1,
      totalVersions: resume.versions.length,
      // We'll use this for the unique key
      key: `${resume.id || resume._id}-${version.version_id || index}`
    }))
  ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const filteredCards = allVersionCards.filter(card => {
    const matchesSearch = (card.type || "Technical Resume")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (card.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatThemes: Record<string, { icon: any, color: string, stripe: string, borderColor: string, badge: string, label: string, action: string }> = {
    latex: { 
      icon: FileCode, 
      color: "text-emerald-500",
      stripe: "bg-emerald-500",
      borderColor: "group-hover:border-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", 
      label: "Institutional LaTeX",
      action: "Edit Source →"
    },
    pdf: { 
      icon: FileText, 
      color: "text-red-500",
      stripe: "bg-red-500",
      borderColor: "group-hover:border-red-500",
      badge: "bg-red-500/10 text-red-600 border-red-500/20", 
      label: "Portable Document",
      action: "Insight Hub →"
    },
    docx: { 
      icon: FileText, 
      color: "text-blue-500",
      stripe: "bg-blue-500",
      borderColor: "group-hover:border-blue-500",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20", 
      label: "Word Processing",
      action: "Insight Hub →"
    },
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
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Documents</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light pr-4">Your professional document pipeline and institutional status.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 border-b border-slate-50 dark:border-slate-900 pb-4">
        <div className="flex-1 w-full flex items-center gap-3">
          <Search size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="bg-transparent w-full text-sm font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-primary transition-all rounded-none border-b border-transparent focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {["all", "approved", "submitted", "rejected", "draft"].map((status) => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
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
      ) : filteredCards.length === 0 ? (
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
          {filteredCards.map((version, i) => {
            const resumeId = version.resumeId;
            const cardId = version.key;
            const formatKey = (version.format as string)?.toLowerCase() || 'latex';
            const formatTheme = formatThemes[formatKey] || formatThemes.latex;
            const FormatIcon = formatTheme.icon;

            return (
              <motion.div
                key={cardId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer space-y-4"
                onClick={() => {
                  router.push(`/dashboard/student/resumes/${resumeId}/edit`);
                }}
              >
                <div className={cn(
                  "aspect-[4/3] rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 border-b-[3px] border-b-transparent shadow-sm flex flex-col p-8 transition-all group-hover:bg-slate-50 dark:group-hover:bg-slate-900 relative overflow-hidden group-hover:shadow-md group-hover:-translate-y-1",
                  formatTheme.borderColor
                )}>
                  {/* Hover Accent Bar - Always visible 2px, grows to 6px */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] group-hover:h-1.5 transition-all duration-300",
                    formatTheme.color.replace('text-', 'bg-')
                  )} />
                  <div className="flex justify-between items-start">
                    <div className={cn("transition-colors flex items-start gap-3", formatTheme.color)}>
                      <FormatIcon size={24} strokeWidth={1.5} className="mt-1" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Format</span>
                         <span className={cn("text-xs font-black uppercase tracking-widest", formatTheme.color)}>{version.format || "LATEX"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border transition-all",
                        statusColors[version.status as string] || statusColors.draft
                      )}>
                        {version.status || "draft"}
                      </div>
                      <button 
                        ref={el => { buttonRefs.current[cardId] = el; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === cardId ? null : cardId);
                        }}
                        className={cn(
                          "p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
                          openMenuId === cardId && "text-primary bg-slate-100 dark:bg-slate-800"
                        )}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto flex flex-col items-start space-y-2 relative z-10">
                    <div className="flex items-center gap-1.5 opacity-60">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">V.{version.versionIndex}</p>
                       <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                       <p className={cn("text-[9px] font-black uppercase tracking-widest", formatTheme.color)}>{formatTheme.label}</p>
                    </div>
                    <h3 className="text-xl font-medium leading-tight text-slate-800 dark:text-white transition-colors group-hover:text-primary line-clamp-1">
                      {version.type || "Untitled"}
                    </h3>
                  </div>
                </div>
                <div className="px-2 flex justify-between items-center text-[11px]">
                   <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-light">
                      <Sparkles size={10} className="text-primary/40" />
                      <span>Institutional Score: <span className="font-bold text-slate-700 dark:text-slate-200">{version.ai_score?.total || "--"}</span></span>
                   </div>
                   <span className="text-primary/70 dark:text-slate-300 group-hover:text-primary transition-colors font-bold uppercase tracking-widest text-[9px]">
                     {formatTheme.action}
                   </span>
                </div>

                {/* Portal-based Menu */}
                {openMenuId === cardId && menuPosition && typeof document !== 'undefined' && createPortal(
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

                        <button
                          onClick={() => {
                            setVersionDialogResume({
                              id: resumeId,
                              format: version.format || 'latex',
                              type: version.type || 'Technical Resume'
                            });
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                        >
                          <Upload size={14} />
                          <span>Upload New Version</span>
                        </button>

                        {(version.status === 'draft' || version.status === 'rejected') && (
                          <button
                            onClick={() => handleSubmitResume(resumeId)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors"
                          >
                            <Send size={14} />
                            <span>Submit Review</span>
                          </button>
                        )}

                        {version.file_url && (version.format as string)?.toLowerCase() !== 'docx' && (
                          <button
                            onClick={() => window.open(version.file_url, '_blank')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download size={14} />
                            <span>Download PDF</span>
                          </button>
                        )}
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                        
                        <button
                          onClick={() => handleDeleteVersion(resumeId, version.version_id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Delete Version</span>
                        </button>

                        <button
                          onClick={() => handleDeleteResume(resumeId)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash size={14} />
                          <span>Delete Entire Record</span>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateOpen(true)}
            className="aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/[0.02] transition-all cursor-pointer group shadow-sm bg-white/50 dark:bg-slate-900/20"
          >
             <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Plus size={32} strokeWidth={1.5} />
             </div>
             <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Add New Document</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Initialize Milestone</p>
             </div>
          </motion.div>
        </div>
      )}

      <CreateResumeDialog 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateResume}
      />

      {versionDialogResume && (
        <AddVersionDialog
          isOpen={!!versionDialogResume}
          onClose={() => setVersionDialogResume(null)}
          resumeId={versionDialogResume.id}
          currentFormat={versionDialogResume.format}
          currentType={versionDialogResume.type}
          onAddVersion={handleAddVersion}
        />
      )}
    </div>
  );
}
