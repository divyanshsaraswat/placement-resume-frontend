"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { 
  FileText,
  Loader2,
  Play,
  Sparkles,
  CheckCircle,
  FileCode,
  ChevronRight,
  MessageSquare,
  User,
  Calendar,
  X,
  AlertCircle,
  Clock,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resumeApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EditorHeader } from "@/components/resume/EditorHeader";
import { AIDrawer } from "@/components/resume/AIDrawer";
import { DocumentViewer } from "@/components/resume/DocumentViewer";
import { useAuth } from "@/context/auth-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export default function ResumeEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [resumeName, setResumeName] = useState("");
  const [format, setFormat] = useState<string>("latex");
  const [code, setCode] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [impactFeedback, setImpactFeedback] = useState<string | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedCode, setLastSavedCode] = useState("");

  // Queue / WebSocket compile state
  const [compileStatus, setCompileStatus] = useState<string | null>(null); // queued | processing | completed | error
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [queueEta, setQueueEta] = useState<number>(0);
  const [compileError, setCompileError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [latestVersionData, setLatestVersionData] = useState<any>(null);
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

  const fetchResume = async () => {
    try {
      const data = await resumeApi.getResume(id as string);
      const latestVersion = data.versions?.[data.versions.length - 1];
      const vCount = data.versions?.length || 1;
      setResumeName(`${latestVersion?.type || "Technical Resume"} - v${vCount}`);
      if (latestVersion) {
          setLatestVersionData(latestVersion);
          setFormat(latestVersion.format || "latex");
          setCode(latestVersion.latex_code || "");
          setExtractedText(latestVersion.parsed_data?.extracted_text || "");
          
          if ((latestVersion.format === 'pdf' || latestVersion.format === 'docx') && latestVersion.file_url) {
            const finalUrl = latestVersion.file_url.startsWith('/') 
              ? latestVersion.file_url 
              : `/${latestVersion.file_url}`;
            setPdfUrl(finalUrl);
          }

          if (latestVersion.ai_score) {
            setScore(latestVersion.ai_score.total);
            setImpactFeedback(latestVersion.ai_score.impact);
            setAtsFeedback(latestVersion.ai_score.ats);
            setSuggestions(latestVersion.ai_score.suggestions || []);
          }
          setLastSavedCode(latestVersion.latex_code || "");
          setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch document state");
    }
  };

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  useEffect(() => {
    if (searchParams?.get('openReview') === 'true') {
      setShowRemarkModal(true);
    }
  }, [searchParams]);

  const handleReload = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Reload Document",
      message: "Are you sure you want to reload from the cloud vault? Any unsaved local changes will be permanently lost.",
      variant: "warning",
      onConfirm: () => fetchResume(),
    });
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      toast.error("No document build available to download. Please recompile first.");
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${resumeName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Document download initialized");
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await resumeApi.saveResume(id as string, { content: code });
      toast.success("Changes synced to cloud vault");
      setLastSavedCode(code);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (code !== lastSavedCode) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [code, lastSavedCode]);

  // Navigation guard for browser-level (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((hasUnsavedChanges || isCompiling) && latestVersionData?.status !== 'approved') {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isCompiling]);

  const handleBack = async () => {
    if (isCompiling) {
      setConfirmConfig({
        isOpen: true,
        title: "Build In Progress",
        message: "A document build is currently running. Leaving now will abort the compilation. Are you sure?",
        variant: "danger",
        onConfirm: async () => {
          // Close WebSocket and abort
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
          setIsCompiling(false);
          setCompileStatus(null);
          if (hasUnsavedChanges) {
            try {
              await resumeApi.saveResume(id as string, { content: code });
            } catch (_) {}
          }
          router.push("/dashboard/student/resumes");
        }
      });
      return;
    }
    if (hasUnsavedChanges && latestVersionData?.status !== 'approved') {
      setConfirmConfig({
        isOpen: true,
        title: "Unsaved Changes",
        message: "You have unsaved institutional data. Would you like to synchronize with the cloud before exiting?",
        variant: "warning",
        onConfirm: async () => {
          try {
            setIsSaving(true);
            await resumeApi.saveResume(id as string, { content: code });
            toast.success("Changes saved!");
            setHasUnsavedChanges(false);
            router.push("/dashboard/student/resumes");
          } catch (err) {
            toast.error("Cloud synchronization failed");
          } finally {
            setIsSaving(false);
          }
        }
      });
    } else {
      router.push("/dashboard/student/resumes");
    }
  };

  // Utility to extract job ID from a pdfUrl like '/public/temp_latex/job-id-here/resume.pdf'
  const extractJobId = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/\/temp_latex\/([^\/]+)\//);
    return match ? match[1] : null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close any active WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      const jobId = extractJobId(pdfUrl);
      if (jobId) {
        resumeApi.cleanupLatexJob(jobId).catch(console.error);
      }
    };
  }, [pdfUrl]);

  const handleCompile = async () => {
    try {
      setIsCompiling(true);
      setCompileStatus("submitting");
      setCompileError(null);

      // Cleanup previous job
      const oldJobId = extractJobId(pdfUrl);
      if (oldJobId) {
        resumeApi.cleanupLatexJob(oldJobId).catch(console.error);
      }

      // Submit async compile job
      const { job_id, queue_position, eta_seconds } = await resumeApi.compileAsync(code);
      setQueuePosition(queue_position);
      setQueueEta(eta_seconds);
      setCompileStatus(queue_position > 0 ? "queued" : "processing");

      // Connect WebSocket for live updates
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/latex/${job_id}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCompileStatus(data.status);

          if (data.status === "queued") {
            setQueuePosition(data.position || 0);
            setQueueEta(data.eta_seconds || 0);
          } else if (data.status === "processing") {
            setQueuePosition(0);
            setQueueEta(0);
          } else if (data.status === "completed") {
            if (data.pdf_url) {
              setPdfUrl(data.pdf_url);
            }
            setIsCompiling(false);
            setCompileStatus(null);
            ws.close();
            wsRef.current = null;
          } else if (data.status === "error") {
            setCompileError(data.error || "Compilation failed");
            toast.error(data.error || "Institutional build failed");
            setIsCompiling(false);
            setCompileStatus(null);
            ws.close();
            wsRef.current = null;
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onerror = () => {
        // Fallback to polling if WebSocket fails
        ws.close();
        wsRef.current = null;
        pollCompileStatus(job_id);
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch (err) {
      toast.error("Institutional build failed");
      setIsCompiling(false);
      setCompileStatus(null);
    }
  };

  const handleCancelCompile = () => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // Cleanup the job on the backend
    const jobId = extractJobId(pdfUrl);
    if (jobId) {
      resumeApi.cleanupLatexJob(jobId).catch(console.error);
    }
    setIsCompiling(false);
    setCompileStatus(null);
    setCompileError(null);
    toast.info("Compilation cancelled");
  };

  // Polling fallback (if WebSocket connection fails)
  const pollCompileStatus = useCallback(async (jobId: string) => {
    const poll = async () => {
      try {
        const data = await resumeApi.getCompileStatus(jobId);
        setCompileStatus(data.status);

        if (data.status === "queued") {
          setQueuePosition(data.position || 0);
          setQueueEta(data.eta_seconds || 0);
          setTimeout(poll, 1000);
        } else if (data.status === "processing") {
          setQueuePosition(0);
          setTimeout(poll, 1000);
        } else if (data.status === "completed" || data.status === "error") {
          if (data.pdf_url) {
            setPdfUrl(data.pdf_url);
          }
          if (data.status === "error") {
            setCompileError(data.error || "Compilation failed");
            toast.error(data.error || "Institutional build failed");
          }
          setIsCompiling(false);
          setCompileStatus(null);
        } else {
          // unknown status, keep polling
          setTimeout(poll, 2000);
        }
      } catch {
        setIsCompiling(false);
        setCompileStatus(null);
        toast.error("Failed to check compilation status");
      }
    };
    poll();
  }, []);

  const handleAnalyze = async () => {
    setIsAIOpen(true);
    setAiError(null);
    setSuggestions([]);
    setScore(null);
    setImpactFeedback(null);
    setAtsFeedback(null);
    try {
      setIsAnalyzing(true);
      const data = await resumeApi.getSuggestions(code);
      setSuggestions(data.improvement_suggestions || []);
      setScore(data.score || null);
      setImpactFeedback(data.impact_feedback || null);
      setAtsFeedback(data.ats_feedback || null);

      // Silent sync score to DB
      if (data.score !== undefined) {
        resumeApi.saveResume(id as string, {
          ai_score: {
            total: data.score,
            impact: data.impact_feedback,
            ats: data.ats_feedback,
            suggestions: data.improvement_suggestions
          }
        }).catch(err => console.error("Failed to sync score:", err));
      }
      
      // Refresh user to update credit count
      refreshUser();
    } catch (err: any) {
      if (err.response?.status === 402) {
        setAiError("⚠️ Institutional Rate Limit Reached: Your hourly LLM credits have been exhausted. Refills happen every 60 minutes.");
        toast.error("Insufficient credits for AI analysis");
      } else {
        setAiError("Triansh AI node is temporarily unreachable. Please ensure you're connected to the campus network.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditorWillMount = (monaco: any) => {
    // Register a more robust LaTeX definition if needed
    monaco.languages.register({ id: 'latex' });
    monaco.languages.setMonarchTokensProvider('latex', {
      defaultToken: '',
      tokenPostfix: '.latex',
      keywords: [
        'documentclass', 'usepackage', 'begin', 'end', 'section', 'subsection',
        'subsubsection', 'paragraph', 'subparagraph', 'author', 'title', 'date',
        'maketitle', 'tableofcontents', 'label', 'ref', 'cite', 'bibliography',
        'bibliographystyle', 'include', 'input', 'newcommand', 'renewcommand',
        'newenvironment', 'renewenvironment', 'textbf', 'textit', 'underline',
        'emph', 'item', 'itemize', 'enumerate', 'description', 'footnote',
        'caption', 'includegraphics'
      ],
      tokenizer: {
        root: [
          [/^\s*%.*$/, 'comment'],
          [/\\(?:[a-zA-Z]+|.)/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'tag'
            }
          }],
          [/[{}()\[\]]/, 'delimiter'],
          [/[0-9]+/, 'number'],
          [/"/, 'string', '@string'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ],
      },
    });

    // register completion provider
    monaco.languages.registerCompletionItemProvider('latex', {
      triggerCharacters: ['\\'],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          // Common LaTeX Environments
          {
            label: 'itemize',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '\\begin{itemize}',
              '\t\\item ${1:Item content}',
              '\t\\item ${2:Item content}',
              '\\end{itemize}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertValueRule.InsertAsSnippet,
            documentation: 'Itemized list environment',
            range: range
          },
          {
            label: 'enumerate',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '\\begin{enumerate}',
              '\t\\item ${1:First item}',
              '\t\\item ${2:Second item}',
              '\\end{enumerate}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertValueRule.InsertAsSnippet,
            documentation: 'Numbered list environment',
            range: range
          },
          {
            label: 'center',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              '\\begin{center}',
              '\t$0',
              '\\end{center}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertValueRule.InsertAsSnippet,
            documentation: 'Centered text block',
            range: range
          },
          // Common Commands
          ...['section', 'subsection', 'subsubsection', 'textbf', 'textit', 'underline', 'item', 'label', 'ref', 'cite', 'url', 'href', 'title', 'author', 'date', 'maketitle', 'tableofcontents', 'documentclass', 'usepackage'].map(cmd => ({
            label: cmd,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: cmd,
            documentation: `LaTeX command: \\${cmd}`,
            range: range
          }))
        ];

        return { suggestions };
      }
    });

    // Provide word-based suggestions too
    monaco.languages.setLanguageConfiguration('latex', {
      wordPattern: /(-?\d*\.\d\w*)|([^\`\\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      comments: {
        lineComment: '%'
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    });
    
    monaco.editor.defineTheme('institutional-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'tag', foreground: '93c5fd' },
        { token: 'comment', foreground: '475569', fontStyle: 'italic' },
        { token: 'string', foreground: '34d399' },
        { token: 'delimiter', foreground: '94a3b8' },
        { token: 'number', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#020617',
        'editor.lineHighlightBackground': '#1e293b40',
        'editorGutter.background': '#020617',
        'editor.selectionBackground': '#3b82f640',
        'editor.foreground': '#94a3b8',
      }
    });
  };

  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  const handleSubmit = async () => {
    if (hasUnsavedChanges) {
      setConfirmConfig({
        isOpen: true,
        title: "Incomplete Synchronization",
        message: "Your latest changes haven't been synced to the vault. Submit the last saved version anyway?",
        variant: "warning",
        onConfirm: async () => {
          try {
            setIsSubmitting(true);
            await resumeApi.submitResume(id as string);
            toast.success("Document successfully moved to institutional verification queue");
            fetchResume();
          } catch (err) {
            toast.error("Submission failed. Please try again.");
          } finally {
            setIsSubmitting(false);
          }
        }
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await resumeApi.submitResume(id as string);
      toast.success("Document successfully moved to institutional verification queue");
      fetchResume();
    } catch (err) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-background">
      <EditorHeader 
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onSubmit={handleSubmit}
        onBack={handleBack}
        onAIOpen={handleAnalyze}
        onDownload={handleDownload}
        title={resumeName || (format === 'latex' ? "Institutional Technical Resume" : `${format.toUpperCase()} Document Review`)}
        status={latestVersionData?.status}
        onShowRemark={() => setShowRemarkModal(true)}
      />

      {/* Dynamic Status Remark Modal */}
      <AnimatePresence>
        {showRemarkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                    Review Details
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold",
                       latestVersionData?.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" :
                       latestVersionData?.status === 'rejected' ? "bg-rose-500/10 text-rose-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      {latestVersionData?.status}
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
                    {latestVersionData?.reviewer_remark ? (
                       <span className="whitespace-pre-wrap">{latestVersionData.reviewer_remark}</span>
                    ) : (
                       <span className="italic text-slate-400">No specific remarks were provided by the reviewer.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Reviewer</span>
                      <div className="flex items-center gap-2">
                        {latestVersionData?.reviewer_picture_url ? (
                          <img 
                            src={latestVersionData.reviewer_picture_url} 
                            alt="Reviewer" 
                            className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User size={10} className="text-slate-400" />
                          </div>
                        )}
                        <p className="text-xs font-bold">{latestVersionData?.reviewer_name || "Unknown Reviewer"}</p>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Date</span>
                      <p className="text-xs font-bold">{latestVersionData?.reviewed_at ? new Date(latestVersionData.reviewed_at).toLocaleString() : "N/A"}</p>
                   </div>
                </div>

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

      {/* Mobile View Switcher */}
      {format === 'latex' && (
        <div className="flex md:hidden border-b border-border bg-slate-50 dark:bg-slate-900/50 p-1">
           <button 
             onClick={() => setMobileView("editor")}
             className={cn(
               "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
               mobileView === "editor" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground"
             )}
           >
             Editor
           </button>
           <button 
             onClick={() => setMobileView("preview")}
             className={cn(
               "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
               mobileView === "preview" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground"
             )}
           >
             Preview
           </button>
        </div>
      )}

      <main className={cn(
        "flex-1 flex flex-col md:flex-row min-h-0 bg-background",
        format === 'latex' && isResizing && "select-none"
      )}>
        {format === 'latex' ? (
          <>
            {/* Left Pane: Editor */}
            <div 
              className={cn(
                "border-r border-border bg-background flex flex-col relative overflow-hidden h-full transition-all duration-300",
                mobileView === "editor" ? "flex" : "hidden md:flex"
              )}
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : `${leftWidth}%` }}
            >
              <div className="flex-1 overflow-hidden relative h-full">
                <Editor
                  height="100%"
                  language="latex"
                  theme="institutional-dark"
                  value={code}
                  beforeMount={handleEditorWillMount}
                  onChange={(val) => setCode(val || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    fontFamily: "var(--font-mono)",
                    lineNumbers: "on",
                    padding: { top: 24, bottom: 24 },
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                />
              </div>
            </div>

            {/* Resizable Divider - Hidden on Mobile */}
            <div 
              onMouseDown={() => setIsResizing(true)}
              className={cn(
                "hidden md:flex w-1 group relative cursor-col-resize hover:bg-primary/30 transition-colors z-10 items-center justify-center",
                isResizing && "bg-primary/50"
              )}
            >
               <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-900 border border-border p-1 rounded-full flex flex-col gap-1 shadow-xl shadow-black/20">
                     <div className="flex gap-1 px-1 py-1">
                        <div className="w-1 h-3 bg-border rounded-full" />
                        <div className="w-1 h-3 bg-border rounded-full" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Pane: Preview */}
            <div 
              className={cn(
                "flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/10 transition-all duration-300 overflow-hidden relative",
                mobileView === "preview" ? "flex" : "hidden md:flex"
              )}
              style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : `${100 - leftWidth}%` }}
            >
              {/* Recompile Toolbar - Above PDF */}
              <div className="flex items-center px-3 py-2   dark:bg-slate-900/80 backdrop-blur-sm shrink-0">
                <button
                  onClick={handleCompile}
                  disabled={isCompiling}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 disabled:opacity-60"
                >
                  {isCompiling ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Play size={13} className="fill-current" />
                  )}
                  {isCompiling ? "Building..." : "Recompile"}
                </button>
              </div>

              {/* PDF Container */}
              <div className="flex-1 p-4 md:p-8 overflow-auto flex justify-center bg-slate-200/20 dark:bg-black/40 relative">
                {/* Queue / Compile Overlay */}
                <AnimatePresence>
                  {isCompiling && compileStatus && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="flex flex-col items-center text-center space-y-6 max-w-xs"
                      >
                        {/* Animated spinner */}
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full border-2 border-primary/20" />
                          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {compileStatus === "queued" ? (
                              <Layers size={24} className="text-primary" />
                            ) : (
                              <Play size={24} className="text-primary fill-primary" />
                            )}
                          </div>
                        </div>

                        {compileStatus === "queued" && (
                          <>
                            <div className="space-y-1">
                              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                                In Queue
                              </p>
                              <p className="text-2xl font-black text-white tracking-tight">
                                Position #{queuePosition}
                              </p>
                            </div>
                            {queueEta > 0 && (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <Clock size={14} className="text-primary" />
                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                                  ~{queueEta}s remaining
                                </span>
                              </div>
                            )}
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                              The build server is processing other documents.<br/>
                              Your compilation will begin automatically.
                            </p>
                          </>
                        )}

                        {(compileStatus === "processing" || compileStatus === "submitting") && (
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                              {compileStatus === "submitting" ? "Submitting" : "Compiling"}
                            </p>
                            <p className="text-sm font-bold text-slate-300">
                              {compileStatus === "submitting"
                                ? "Sending to build server..."
                                : "pdflatex is generating your document..."
                              }
                            </p>
                          </div>
                        )}

                        {/* Cancel Button */}
                        <button
                          onClick={handleCancelCompile}
                          className="mt-4 flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          <X size={14} />
                          Cancel Build
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {pdfUrl ? (
                  <div className="w-full max-w-4xl h-full">
                    <DocumentViewer url={pdfUrl} format="pdf" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-30 my-20">
                     <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-dashed border-primary/50 flex items-center justify-center">
                        <FileText strokeWidth={0.5} className="text-primary w-8 h-8 md:w-12 md:h-12" />
                     </div>
                     <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Awaiting Build</p>
                        <p className="text-[10px] font-light text-muted-foreground">Perform a recompile to render the <br /> institutional document preview</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* PDF/DOCX Content - Direct Viewer */
          <div className="flex-1 p-4 md:p-8 overflow-auto flex justify-center bg-slate-200/20 dark:bg-black/40 h-full relative">
            {pdfUrl ? (
              <div className="w-full max-w-4xl h-full flex flex-col space-y-6 py-4 md:py-8">
                 <div className="flex items-center justify-between px-2 shrink-0">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black tracking-widest text-primary uppercase">Institutional Preview</h3>
                      <p className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Original {format} Document</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                       Verified Vault Record
                    </div>
                 </div>
                 <div className="flex-1 min-h-[800px] md:min-h-0 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-border bg-white dark:bg-slate-900 shadow-2xl shadow-black/10">
                    <DocumentViewer url={pdfUrl} format={format} />
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-30 my-20">
                 <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-dashed border-primary/50 flex items-center justify-center">
                    <FileText strokeWidth={0.5} className="text-primary w-8 h-8 md:w-12 md:h-12" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Awaiting Asset</p>
                    <p className="text-[10px] font-light text-muted-foreground">The institutional {format.toUpperCase()} record <br /> is being prepared for preview</p>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      <AIDrawer 
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        suggestions={suggestions}
        score={score}
        impactFeedback={impactFeedback}
        atsFeedback={atsFeedback}
        isLoading={isAnalyzing}
        error={aiError}
        onRetry={handleAnalyze}
        resumeContent={format === 'latex' ? code : extractedText}
        format={format}
      />
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
