"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  FileText,
  Loader2,
  Play
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { resumeApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EditorHeader } from "@/components/resume/EditorHeader";
import { AIDrawer } from "@/components/resume/AIDrawer";

export default function ResumeEditorPage() {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [view, setView] = useState<"code" | "visual">("code");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [impactFeedback, setImpactFeedback] = useState<string | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string | null>(null);

  const [leftWidth, setLeftWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const data = await resumeApi.getResume(id as string);
        const latestVersion = data.versions?.[data.versions.length - 1];
        if (latestVersion) {
            setCode(latestVersion.latex_code || "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (id) fetchResume();
  }, [id]);

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
      await resumeApi.saveResume(id as string, code);
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

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-background">
      <EditorHeader 
        view={view}
        onViewChange={setView}
        isSaving={isSaving}
        onSave={handleSave}
        onAIOpen={handleAnalyze}
        title="Institutional Technical Resume"
      />

      <main className={cn(
        "flex-1 flex min-h-0 bg-slate-50/30 dark:bg-black/20",
        isResizing && "select-none"
      )}>
        {/* Left Pane: Editor */}
        <div 
          className="border-r border-border bg-background flex flex-col relative overflow-hidden h-full"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="flex-1 overflow-hidden relative h-full">
            {view === "code" ? (
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
            ) : (
              <div className="h-full flex items-center justify-center p-20 text-center">
                 <div className="space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mx-auto">
                       <FileText size={32} strokeWidth={1} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Visual Editor Engine</h3>
                    <p className="text-muted-foreground text-sm font-light max-w-xs mx-auto">
                      Form-based editing is currently in maintenance. Please use the Code Editor for precise institutional alignment.
                    </p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Resizable Divider */}
        <div 
          onMouseDown={() => setIsResizing(true)}
          className={cn(
            "w-1 group relative cursor-col-resize hover:bg-primary/30 transition-colors z-10 flex items-center justify-center",
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
        <div className="flex-1 flex flex-col bg-slate-100/50 dark:bg-slate-900/40 relative overflow-hidden">
          {/* Preview Toolbar */}
          <div className="h-12 border-b border-border/50 bg-white/50 dark:bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-4">
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
             <div className="flex items-center gap-4 text-muted-foreground">
                <div className="text-[10px] font-bold uppercase tracking-widest">Page 1 / 1</div>
                <div className="w-px h-4 bg-border/50" />
                <div className="text-[10px] font-bold uppercase tracking-widest">85% Zoom</div>
             </div>
          </div>

          {/* PDF Container */}
          <div className="flex-1 p-8 overflow-auto flex justify-center bg-slate-200/20 dark:bg-black/40">
            {pdfUrl ? (
              <iframe 
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-[1200px] max-w-3xl bg-white shadow-2xl rounded-sm"
                title="Resume Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                 <div className="w-24 h-24 rounded-full border border-dashed border-primary/50 flex items-center justify-center">
                    <FileText size={48} strokeWidth={0.5} className="text-primary" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Awaiting Build</p>
                    <p className="text-[10px] font-light text-muted-foreground">Perform a recompile to render the <br /> institutional document preview</p>
                 </div>
              </div>
            )}
          </div>
        </div>
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
      />
    </div>
  );
}
