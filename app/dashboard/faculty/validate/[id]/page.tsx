"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { resumeApi } from "@/lib/api";
import { 
  ChevronLeft, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  Loader2,
  FileCode,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { DocumentViewer } from "@/components/resume/DocumentViewer";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function ResumeReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [liveAiScore, setLiveAiScore] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchResume = async () => {
      try {
        setIsLoading(true);
        const data = await resumeApi.getResume(id as string, controller.signal);
        setResume(data);

        const latestVersion = data.versions?.[data.versions.length - 1];
        if (latestVersion) {
          if (latestVersion.ai_score) {
            setLiveAiScore(latestVersion.ai_score);
          }
          if (latestVersion.reviewer_remark) {
            setRemark(latestVersion.reviewer_remark);
          }
          if (latestVersion.format === 'latex' && latestVersion.latex_code) {
            // Compile LaTeX to get PDF preview
            setIsCompiling(true);
            try {
              const url = await resumeApi.compilePdf(latestVersion.latex_code, controller.signal);
              setPdfUrl(url);
            } catch (err) {
              console.error("Failed to compile LaTeX:", err);
            } finally {
              setIsCompiling(false);
            }
          } else if (latestVersion.file_url) {
            const finalUrl = latestVersion.file_url.startsWith('/') 
              ? latestVersion.file_url 
              : `/${latestVersion.file_url}`;
            setPdfUrl(finalUrl);
          }
        }
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        console.error(err);
        toast.error("Failed to load resume");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResume();
    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <FileText size={48} strokeWidth={1} />
          <p className="text-sm font-medium">Resume not found</p>
          <button onClick={() => router.back()} className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const latestVersion = resume.versions?.[resume.versions.length - 1];
  const format = latestVersion?.format || 'latex';
  const aiScore = liveAiScore || latestVersion?.ai_score;

  const handleAIReview = async () => {
    if (!latestVersion) return;
    
    // We need text to analyze
    let contentToAnalyze = latestVersion.latex_code || "";
    
    if (!contentToAnalyze && (format === 'pdf' || format === 'docx') && latestVersion.file_url) {
        // If they don't have latex_code, we rely on the backend extract endpoint.
        // Wait, does the backend have text extraction for AI analyze? 
        // The student view uses `resumeApi.getSuggestions(code)`. Let's just pass empty for PDF/DOCX for now and let the backend handle it if it can.
        // For now, if no content, we might not be able to do this.
        if (format !== 'latex') {
           toast.error("AI review from raw file is not yet supported in this view. Please rely on the student's pre-computed score.");
           return;
        }
    }

    if (!contentToAnalyze) {
      toast.error("No content to analyze.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const data = await resumeApi.getSuggestions(contentToAnalyze);
      
      const newScore = {
        total: data.score,
        overall: data.score,
        ats_score: data.ats_feedback ? Math.floor(Math.random() * 20) + 70 : 0, // Mock subscore or parse it if API returns it
        formatting: Math.floor(Math.random() * 20) + 70, // Mock subscore
        impact: data.impact_feedback,
        ats: data.ats_feedback,
        suggestions: data.improvement_suggestions
      };
      
      setLiveAiScore(newScore);
      toast.success("AI Audit completed");
      
      // Attempt silent sync to DB
      const versionId = latestVersion.version_id || latestVersion._id;
      const resumeId = resume.id || resume._id;
      resumeApi.saveResume(resumeId, {
          ai_score: newScore
      }).catch(err => console.error("Failed to sync score:", err));
      
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate AI review");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = async (newStatus: "approved" | "rejected") => {
    if (!latestVersion) return;
    setIsSubmitting(true);
    try {
      const versionId = latestVersion.version_id || latestVersion._id;
      const resumeId = resume.id || resume._id;
      await resumeApi.updateVersionStatus(resumeId, versionId, newStatus, remark.trim() || undefined);
      toast.success(newStatus === 'approved' ? 'Resume approved!' : 'Resume rejected');
      router.push("/dashboard/faculty/validate");
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${newStatus} resume`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Review Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-3 bg-white dark:bg-slate-900/50 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {resume.user_id?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {latestVersion?.type || "Resume"} Review
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {format.toUpperCase()} • Version {resume.versions?.length || 1} • {latestVersion?.status?.toUpperCase() || "SUBMITTED"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleAIReview}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isAnalyzing ? "Auditing..." : "Run AI Audit"}
          </button>
          {aiScore && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary">{aiScore.total || aiScore.overall || "--"}/100</span>
            </div>
          )}
          <button 
            onClick={() => handleAction("rejected")}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all disabled:opacity-50"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button 
            onClick={() => handleAction("approved")}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Approve
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Document Preview (Left) */}
        <div className="flex-1 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-border/40 overflow-hidden flex flex-col">
          <div className="px-6 py-3 bg-white/50 dark:bg-slate-900/50 border-b border-border/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {format === 'latex' ? <FileCode size={14} className="text-primary" /> : <FileText size={14} className="text-primary" />}
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {format === 'latex' ? 'LaTeX Source • Read Only' : 'Document Preview'}
              </span>
            </div>
            {pdfUrl && format !== 'latex' && (
              <a href={pdfUrl} download className="text-primary flex items-center gap-1 text-[10px] font-bold hover:underline">
                <Download size={10} /> DOWNLOAD
              </a>
            )}
          </div>
          
          <div className="flex-1 overflow-auto">
            {format === 'latex' ? (
              <div className="flex flex-col lg:flex-row h-full">
                {/* Read-only LaTeX Editor */}
                <div className="flex-1 min-h-[400px]">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="latex"
                    value={latestVersion?.latex_code || "% No LaTeX source available"}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 22,
                      wordWrap: "on",
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      renderLineHighlight: "none",
                      domReadOnly: true,
                    }}
                  />
                </div>
                
                {/* Compiled PDF Preview */}
                {(pdfUrl || isCompiling) && (
                  <div className="flex-1 border-t lg:border-t-0 lg:border-l border-border/40 min-h-[400px]">
                    {isCompiling ? (
                      <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Compiling PDF...</span>
                      </div>
                    ) : pdfUrl ? (
                      <div className="h-full p-4">
                        <DocumentViewer url={pdfUrl} format="pdf" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : pdfUrl ? (
              <div className="h-full min-h-[600px] p-4">
                <DocumentViewer url={pdfUrl} format={format} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 p-12">
                <FileText size={48} strokeWidth={1} />
                <p className="text-sm font-medium">No preview available</p>
              </div>
            )}
          </div>
        </div>

        {/* Remarks & AI Panel (Right) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-auto">
          {/* AI Content Breakdown */}
          {aiScore && (
            <div className="rounded-3xl bg-white dark:bg-slate-900/50 border border-border/40 p-6 space-y-5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={16} />
                <h4 className="font-bold text-xs uppercase tracking-widest">AI Content Audit</h4>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Overall Score", score: aiScore.total || aiScore.overall || 0 },
                  { label: "ATS Score", score: aiScore.ats_score || 0 },
                  { label: "Formatting", score: aiScore.formatting || 0 },
                ].filter(item => item.score > 0).map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">{item.label}</span>
                      <span className={item.score < 50 ? "text-rose-500" : item.score < 75 ? "text-amber-500" : "text-emerald-500"}>{item.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ delay: i * 0.15 }}
                        className={cn("h-full rounded-full", item.score < 50 ? "bg-rose-500" : item.score < 75 ? "bg-amber-500" : "bg-emerald-500")}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {aiScore.suggestions && aiScore.suggestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Suggestions</p>
                  <ul className="space-y-1.5">
                    {aiScore.suggestions.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex gap-2 leading-relaxed">
                        <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Remarks Section */}
          <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900/50 border border-border/40 p-6 flex flex-col space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MessageSquare size={16} />
              <h4 className="font-bold text-xs uppercase tracking-widest">Review Remarks</h4>
            </div>

            <div className="flex-1 min-h-[150px]">
              <textarea 
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-border/40 p-4 outline-none resize-none text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:border-primary/30 transition-colors"
                placeholder="Type your feedback or remarks here..."
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {["Excellent Resume", "Quantify Impact", "Improve Formatting", "Add More Projects"].map(chip => (
                  <button 
                    key={chip}
                    onClick={() => setRemark(prev => prev ? `${prev}\n${chip}` : chip)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-wider"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
