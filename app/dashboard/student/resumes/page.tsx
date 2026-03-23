'use client'
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/auth-context";
import { FileText, Plus, Search, Filter, MoreVertical, ExternalLink, Loader2, FileCode, FilePenLine, Trash2, Trash, Send, Download, CheckCircle, Upload, Sparkles, MessageSquare, User, Calendar, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { resumeApi } from "@/lib/api";
import { CreateResumeDialog } from "@/components/dashboard/CreateResumeDialog";
import { AddVersionDialog } from "@/components/dashboard/AddVersionDialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

const CardSkeleton = () => (
  <div className="space-y-4">
    <div className="aspect-[4/3] rounded-3xl bg-slate-100/50 dark:bg-slate-900/50 animate-pulse flex flex-col p-6 md:p-8 relative overflow-hidden border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="w-20 h-7 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="w-40 h-7 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      {/* Skeleton Accent Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800" />
    </div>
    <div className="px-2 flex justify-between items-center">
      <div className="w-28 h-3 bg-slate-100 dark:bg-slate-900 rounded-full" />
      <div className="w-16 h-3 bg-slate-100 dark:bg-slate-900 rounded-full" />
    </div>
  </div>
);

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
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedVersionData, setSelectedVersionData] = useState<any>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchResumes = async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await resumeApi.getResumes(signal);
      if (signal?.aborted) return;
      setResumes(data);
      setIsLoading(false);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(err);
      toast.error("Failed to load resumes");
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
      router.push(`/dashboard/student/resumes/${newResume.id || newResume._id}/edit`);
    } catch (err: any) {
      console.error("[ResumeCreate Error]", err);
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : "Failed to create resume");
      toast.error(errorMsg);
    }
  };

  const handleDeleteResume = async (id: string) => {
    setOpenMenuId(null);
    setConfirmConfig({
      isOpen: true,
      title: "Delete Portfolio",
      message: "Are you sure you want to permanently delete this entire document and all its versions? This institutional record cannot be recovered.",
      variant: "danger",
      onConfirm: async () => {
        toast.promise(resumeApi.deleteResume(id), {
          loading: 'Deleting document portfolio...',
          success: () => {
            fetchResumes();
            return 'Document portfolio permanently deleted';
          },
          error: (err: any) => err?.response?.data?.detail || 'Failed to delete document',
        });
      }
    });
  };

  const handleDeleteVersion = async (resumeId: string, versionId: string) => {
    setOpenMenuId(null);
    setConfirmConfig({
      isOpen: true,
      title: "Delete Version",
      message: "Are you sure you want to delete this specific record iteration? This will not affect other versions in the portfolio.",
      variant: "danger",
      onConfirm: async () => {
        toast.promise(resumeApi.deleteVersion(resumeId, versionId), {
          loading: 'Deleting record iteration...',
          success: () => {
            fetchResumes();
            return 'Iterative record deleted successfully';
          },
          error: (err: any) => err?.response?.data?.detail || 'Failed to delete version',
        });
      }
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

  const handleSetDefault = async (id: string) => {
    setOpenMenuId(null);
    toast.promise(resumeApi.setDefaultResume(id), {
      loading: 'Updating primary document...',
      success: () => {
        fetchResumes();
        return 'Document successfully set as primary representation';
      },
      error: (err: any) => err?.response?.data?.detail || 'Failed to update primary status',
    });
  };

  const handleAddVersion = async (resumeId: string, type: string, latexCode: string, format: string, file?: File) => {
    try {
      await resumeApi.addVersion(resumeId, type, latexCode, format, file);
      toast.success('New iterative record successfully verified');
      router.push(`/dashboard/student/resumes/${resumeId}/edit`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to establish new record version');
    }
  };

  const allVersionCards = resumes.flatMap(resume => 
    resume.versions.map((version: any, index: number) => ({
      ...version,
      resumeId: resume.id || resume._id,
      versionIndex: index + 1,
      totalVersions: resume.versions.length,
      reviewHistory: resume.review_history || [],
      isDefault: resume.is_default,
      // We'll use this for the unique key
      key: `${resume.id || resume._id}-${version.version_id || index}`
    }))
  ).sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10 xl:gap-12">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10 xl:gap-12">
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
                  "aspect-[4/3] rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 border-b-[3px] border-b-transparent shadow-sm flex flex-col p-6 md:p-8 transition-all group-hover:bg-slate-50 dark:group-hover:bg-slate-900 relative overflow-hidden group-hover:shadow-md group-hover:-translate-y-1",
                  formatTheme.borderColor
                )}>
                  {/* Hover Accent Bar - Always visible 2px, grows to 6px */}
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] group-hover:h-1.5 transition-all duration-300",
                    formatTheme.color.replace('text-', 'bg-')
                  )} />
                  <div className="flex justify-between items-center">
                    <div className={cn("transition-colors flex items-center gap-2.5", formatTheme.color)}>
                      <FormatIcon size={18} strokeWidth={2.5} />
                      <div className="flex items-center gap-2">
                         <span className={cn("text-xs font-black uppercase tracking-widest", formatTheme.color)}>{version.format || "LATEX"}</span>
                         {version.isDefault && (
                          <motion.div 
                            whileHover={{ scale: 1.2 }}
                            title="Primary Document"
                            className="text-primary transition-all cursor-help"
                          >
                            <Star size={11} fill="currentColor" strokeWidth={0} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (version.status === 'approved' || version.status === 'rejected') {
                            setSelectedVersionData(version);
                            setShowRemarkModal(true);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all whitespace-nowrap",
                          statusColors[version.status as string] || statusColors.draft,
                          (version.status === 'approved' || version.status === 'rejected') && "hover:opacity-80 cursor-pointer"
                        )}>
                        {version.status || "draft"}
                      </button>
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
                        <MoreVertical size={18} />
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
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                       <Sparkles size={10} />
                       <span>AI SCORE <span className="font-bold text-slate-700 dark:text-slate-200 ml-0.5">{version.ai_score?.total || "--"}</span></span>
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

                        {!version.isDefault && (
                          <button
                            onClick={() => handleSetDefault(resumeId)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Star size={14} />
                            <span>Set as Primary</span>
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

      <AnimatePresence>
        {versionDialogResume && (
          <AddVersionDialog 
            isOpen={!!versionDialogResume} 
            onClose={() => setVersionDialogResume(null)}
            resumeId={versionDialogResume?.id || ""}
            currentFormat={versionDialogResume?.format || "latex"}
            currentType={versionDialogResume?.type || "Technical Resume"}
            onAddVersion={handleAddVersion}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Status Remark Modal */}
      <AnimatePresence>
        {showRemarkModal && selectedVersionData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRemarkModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                    Review Details
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold border",
                       statusColors[selectedVersionData.status as string] || statusColors.draft
                    )}>
                      {selectedVersionData.status}
                    </span>
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    Feedback from Review Committee
                  </p>
                </div>
                <button 
                  onClick={() => setShowRemarkModal(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={14} /> Official Remark
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {selectedVersionData.reviewer_remark ? (
                       <span className="whitespace-pre-wrap">{selectedVersionData.reviewer_remark}</span>
                    ) : (
                       <span className="italic text-slate-400">No specific remarks were provided by the reviewer.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Reviewer</span>
                    <div className="flex items-center gap-2">
                      {selectedVersionData.reviewer_picture_url ? (
                        <img 
                          src={selectedVersionData.reviewer_picture_url} 
                          alt="Reviewer" 
                          className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <User size={10} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <p className="text-xs font-bold">{selectedVersionData.reviewer_name || "Institutional Reviewer"}</p>
                        {selectedVersionData.reviewer_role && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {selectedVersionData.reviewer_role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Date</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {selectedVersionData.reviewed_at ? new Date(selectedVersionData.reviewed_at).toLocaleString('en-GB', { 
                        day: '2-digit',
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : "N/A"}
                    </p>
                  </div>
                </div>

                {/* History Section */}
                {selectedVersionData.reviewHistory && selectedVersionData.reviewHistory.length > 1 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} /> Review Timeline
                    </h4>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                      {selectedVersionData.reviewHistory.map((item: any, idx: number) => (
                        <div key={idx} className="relative pl-6 pb-2 last:pb-0">
                          {/* Timeline Line */}
                          {idx !== selectedVersionData.reviewHistory.length - 1 && (
                            <div className="absolute left-2.5 top-5 w-px h-full bg-slate-100 dark:bg-slate-800" />
                          )}
                          {/* Timeline Dot */}
                          <div className={cn(
                            "absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 z-10 flex items-center justify-center shadow-sm",
                            idx === 0 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                          )}>
                             {idx === 0 ? <CheckCircle size={8} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-400" />}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                statusColors[item.status] || statusColors.draft
                              )}>
                                {item.status}
                              </span>
                              <span className="text-[8px] font-medium text-slate-400">
                                {new Date(item.reviewed_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                              "{item.remark || "No remark provided"}"
                            </p>
                            <div className="flex items-center gap-1.5 opacity-60">
                              {item.reviewer_picture_url ? (
                                <img src={item.reviewer_picture_url} className="w-3.5 h-3.5 rounded-full" />
                              ) : (
                                <User size={8} />
                              )}
                              <span className="text-[8px] font-bold">{item.reviewer_name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <button 
                  onClick={() => setShowRemarkModal(false)}
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
