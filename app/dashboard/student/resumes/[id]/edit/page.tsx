"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  FileText,
  Loader2,
  Play,
  Sparkles,
  CheckCircle,
  FileCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { resumeApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EditorHeader } from "@/components/resume/EditorHeader";
import { AIDrawer } from "@/components/resume/AIDrawer";
import { DocumentViewer } from "@/components/resume/DocumentViewer";

export default function ResumeEditorPage() {
  const { id } = useParams();
  const [resumeName, setResumeName] = useState("");
  const [format, setFormat] = useState<string>("latex");
  const [code, setCode] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [impactFeedback, setImpactFeedback] = useState<string | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string | null>(null);

  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);

  const fetchResume = async () => {
    try {
      const data = await resumeApi.getResume(id as string);
      const latestVersion = data.versions?.[data.versions.length - 1];
      const vCount = data.versions?.length || 1;
      setResumeName(`${latestVersion?.type || "Technical Resume"} - v${vCount}`);
      if (latestVersion) {
          setFormat(latestVersion.format || "latex");
          setCode(latestVersion.latex_code || "");
          
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
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch document state");
    }
  };

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  const handleReload = () => {
    if (confirm("Reload from cloud? Unsaved changes will be lost.")) {
      fetchResume();
    }
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
      toast.success("Changes multi-synced to cloud");
    } catch (err) {
      toast.error("Cloud synchronization failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompile = async () => {
    try {
      setIsCompiling(true);
      const url = await resumeApi.compilePdf(code);
      setPdfUrl(url);
    } catch (err) {
      toast.error("Institutional build failed");
    } finally {
      setIsCompiling(false);
    }
  };

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
    } catch (err) {
      setAiError("Institutional AI node is temporarily unreachable. Please ensure you're connected to the campus network.");
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

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-background">
      <EditorHeader 
        isSaving={isSaving}
        onSave={handleSave}
        onAIOpen={handleAnalyze}
        onReload={handleReload}
        onDownload={handleDownload}
        title={resumeName || (format === 'latex' ? "Institutional Technical Resume" : `${format.toUpperCase()} Document Review`)}
      />

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
        "flex-1 flex flex-col md:flex-row min-h-0 bg-slate-50/30 dark:bg-black/20",
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
                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                          ←
                        </div>
                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white">
                          →
                        </div>
                     </div>
                     <div className="flex flex-col gap-0.5 items-center pb-1">
                        <div className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                        <div className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                        <div className="w-0.5 h-0.5 rounded-full bg-slate-600" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Pane: Preview */}
            <div className={cn(
              "flex-1 flex flex-col bg-slate-100/50 dark:bg-slate-900/40 relative overflow-hidden transition-all duration-300",
              mobileView === "preview" ? "flex" : "hidden md:flex"
            )}>
              {/* Preview Toolbar */}
              <div className="h-12 border-b border-border/50 bg-white/50 dark:bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCompile}
                      disabled={isCompiling}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {isCompiling ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Play size={12} />
                      )}
                      Recompile
                    </button>
                 </div>
              </div>

              {/* PDF Container */}
              <div className="flex-1 p-4 md:p-8 overflow-auto flex justify-center bg-slate-200/20 dark:bg-black/40">
                {pdfUrl ? (
                  <div className="w-full max-w-4xl h-[600px] md:h-[1200px]">
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
          /* PDF/DOCX Review Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full">
             {/* Left: Enhanced Viewer */}
             <div className="flex-[3] h-full overflow-y-auto bg-slate-100 dark:bg-slate-950/40 p-4 md:p-12 flex justify-center custom-scrollbar">
                <div className="w-full max-w-4xl space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-[0.1em]">Verification Preview</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Original {format.toUpperCase()} record as initialized.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                        Institutional Match
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full h-[800px] md:h-[1100px]">
                    {pdfUrl ? (
                      <DocumentViewer url={pdfUrl} format={format} />
                    ) : (
                      <div className="h-full w-full rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground animate-pulse gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Initializing vault access...</span>
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Right: Inline AI Review Panel */}
             <div className="flex-[2] h-full border-l border-border bg-white dark:bg-slate-900/30 overflow-y-auto custom-scrollbar p-10 space-y-10">
                <div className="space-y-1">
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    <Sparkles size={14} className="animate-pulse" />
                    Strategic Assessment
                  </h4>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Institutional Review Dashboard</p>
                </div>

                {isAnalyzing ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Running AI Synthesis...</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Score Card */}
                    {score !== null && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group shadow-sm"
                      >
                         <div className="relative z-10">
                            <span className={cn(
                              "text-6xl font-black tracking-tighter",
                              score > 80 ? "text-emerald-500" : score > 60 ? "text-amber-500" : "text-rose-500"
                            )}>
                              {score}
                            </span>
                            <sub className="text-muted-foreground text-sm font-bold ml-1">/100</sub>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Readiness Index</p>
                         </div>
                      </motion.div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-1 gap-4">
                       {impactFeedback && (
                         <div className="p-6 rounded-3xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 space-y-2">
                           <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Leadership Impact</h5>
                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{impactFeedback}</p>
                         </div>
                       )}
                       {atsFeedback && (
                         <div className="p-6 rounded-3xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 space-y-2">
                           <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">System Optimization</h5>
                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{atsFeedback}</p>
                         </div>
                       )}
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Actionable Intelligence</h4>
                      <div className="space-y-4">
                         {suggestions.length > 0 ? suggestions.map((s, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed relative pl-12"
                           >
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
                              {s}
                           </motion.div>
                         )) : (
                           <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No critical failures</p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}
             </div>
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
        resumeContent={code}
      />
    </div>
  );
}
