"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Save, 
  Play, 
  Sparkles, 
  ChevronLeft, 
  Download, 
  History,
  AlertCircle
} from "lucide-react";
import { Link } from "lucide-react"; // Actually let's use next/link
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { resumeApi } from "@/lib/api";

export default function ResumeEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      const data = await resumeApi.getResume(id as string);
      setCode(data.content);
    };
    fetchResume();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    await resumeApi.saveResume(id as string, code);
    setIsSaving(false);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    await resumeApi.compilePdf(code);
    setIsCompiling(false);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const data = await resumeApi.getSuggestions(code);
    setSuggestions(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Editor Toolbar */}
      <div className="flex justify-between items-center px-4 py-3 nm-flat rounded-2xl bg-background">
        <div className="flex items-center gap-4">
          <NextLink href="/dashboard/student/resumes">
            <button className="nm-convex p-2.5 rounded-xl text-muted-foreground hover:nm-inset transition-all">
              <ChevronLeft size={20} />
            </button>
          </NextLink>
          <div>
            <h2 className="text-lg font-semibold">SDE Resume v1</h2>
            <p className="text-xs text-muted-foreground">ID: {id} • Last saved 2m ago</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={handleAnalyze}
             className="nm-convex px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm text-primary font-medium hover:nm-inset transition-all"
           >
             <Sparkles size={18} className={isAnalyzing ? "animate-pulse" : ""} />
             AI Optimize
           </button>
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="nm-convex px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium hover:nm-inset transition-all disabled:opacity-50"
           >
             <Save size={18} />
             {isSaving ? "Saving..." : "Save"}
           </button>
           <button 
             onClick={handleCompile}
             disabled={isCompiling}
             className="nm-primary px-8 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all disabled:opacity-50"
           >
             <Play size={18} />
             {isCompiling ? "Compiling..." : "Compile PDF"}
           </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* LaTeX Code Editor */}
        <div className="flex-1 nm-inset rounded-[2.5rem] overflow-hidden p-6 bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage="latex"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              fontFamily: "Fira Code, monospace",
            }}
          />
        </div>

        {/* Preview & Insights Side Panel */}
        <div className="w-[450px] flex flex-col gap-6">
          {/* PDF Preview Mock */}
          <div className="flex-1 nm-inset rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-white/5 relative flex items-center justify-center">
             <div className="text-center space-y-4 p-8">
                {isCompiling ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-primary font-medium">Generating Resume Preview...</p>
                  </div>
                ) : (
                  <>
                    <FileText size={48} className="text-muted-foreground/20 mx-auto" />
                    <p className="text-muted-foreground font-light italic">Compile to see real-time LaTeX preview</p>
                  </>
                )}
             </div>
             
             {/* Float Download Button */}
             <button className="absolute bottom-6 right-6 nm-convex p-4 rounded-full text-primary hover:nm-inset transition-all">
                <Download size={24} />
             </button>
          </div>

          {/* AI Insights Panel */}
          <div className="h-64 nm-flat rounded-[2.5rem] p-8 space-y-4 overflow-auto">
             <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} />
                <h4 className="font-semibold text-sm uppercase tracking-widest">AI Content Score</h4>
             </div>
             
             {suggestions.length > 0 ? (
               <div className="space-y-3">
                 {suggestions.map((s, i) => (
                   <div key={i} className="flex gap-3 text-sm font-light text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/10">
                      <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                      {s}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center pb-8 border-2 border-dashed border-white/5 rounded-2xl">
                 <p className="text-xs text-muted-foreground/30">Click "AI Optimize" to analyze your resume content</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Icon helper since I mixed them up
function FileText({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
