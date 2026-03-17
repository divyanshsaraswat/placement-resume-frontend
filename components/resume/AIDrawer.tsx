"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, MessageSquare, Bot, RefreshCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { resumeApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  score?: number | null;
  impactFeedback?: string | null;
  atsFeedback?: string | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AIDrawer({ 
  isOpen, 
  onClose, 
  suggestions, 
  score, 
  impactFeedback, 
  atsFeedback, 
  isLoading, 
  error,
  onRetry
}: AIDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your institutional AI companion. How can I help refine your LaTeX resume today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    // Add a placeholder AI message
    setMessages(prev => [...prev, { role: "ai", content: "" }]);

    try {
      await resumeApi.streamChat(updatedMessages, (chunk) => {
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (lastIdx >= 0 && newMsgs[lastIdx].role === "ai") {
            newMsgs[lastIdx] = { 
              ...newMsgs[lastIdx], 
              content: newMsgs[lastIdx].content + chunk 
            };
          }
          return newMsgs;
        });
      });
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", content: "I encountered an error while processing your request. Please try again or check your connectivity." }
      ]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-background border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-[70] flex flex-col rounded-t-[3rem] overflow-hidden"
          >
            {/* Header */}
            <div className="px-10 py-6 border-b border-border/50 flex items-center justify-between bg-primary/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Sparkles size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Institutional AI Assistant</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      error ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {error ? "Engine Fault Detected" : "Active Intelligence Engine"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden">
               {/* Messages Area */}
               <div className="flex-1 flex flex-col min-w-0">
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide"
                  >
                    {messages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(
                          "flex gap-4 max-w-[90%] md:max-w-[700px]",
                          msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                         <div className={cn(
                           "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                           msg.role === "ai" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                         )}>
                            {msg.role === "ai" ? <Bot size={16} /> : <MessageSquare size={16} />}
                         </div>
                          <div className={cn(
                            "px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed",
                            msg.role === "ai" 
                              ? "bg-slate-50 dark:bg-slate-900 border border-border/40 text-foreground shadow-sm prose dark:prose-invert prose-sm max-w-none"
                              : "bg-primary text-white font-medium"
                          )}>
                            {msg.role === "ai" ? (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc ml-5 mb-4 space-y-2">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal ml-5 mb-4 space-y-2">{children}</ol>,
                                  li: ({ children }) => <li className="pl-1">{children}</li>,
                                  code: ({ children }) => <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[12px] font-mono font-medium">{children}</code>,
                                  strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-slate-100">{children}</strong>,
                                  h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 border-b pb-2">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-2">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-md font-bold mt-4 mb-2">{children}</h3>,
                                  table: ({ children }) => (
                                    <div className="overflow-x-auto my-4 rounded-xl border border-border/60 shadow-sm">
                                      <table className="w-full text-xs text-left border-collapse">{children}</table>
                                    </div>
                                  ),
                                  thead: ({ children }) => <thead className="bg-slate-100 dark:bg-slate-800 font-bold">{children}</thead>,
                                  th: ({ children }) => <th className="px-4 py-2 border-b border-border/60">{children}</th>,
                                  td: ({ children }) => <td className="px-4 py-2 border-b border-border/40">{children}</td>,
                                }}
                              >
                                {msg.content
                                  .replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2') // Header needs newline
                                  .replace(/([^\n])(\n[*+-]\s)/g, '$1\n\n$2') // List needs block newline
                                  .replace(/([^\n])(\n\d+\.\s)/g, '$1\n\n$2') // Numbered list needs block newline
                                }
                              </ReactMarkdown>
                            ) : (
                              msg.content
                            )}
                          </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-8 pt-0">
                     <div className="bg-slate-50 dark:bg-slate-900 border border-border/60 rounded-[2rem] p-2 pl-6 flex items-center gap-2 shadow-inner focus-within:border-primary/50 transition-colors">
                        <input 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Ask anything about your resume standards..."
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
                        />
                        <button 
                          onClick={handleSend}
                          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                          <Send size={16} />
                        </button>
                     </div>
                  </div>
               </div>

                <div className="w-[420px] border-l border-border/50 bg-slate-50/50 dark:bg-slate-950/30 p-8 space-y-8 overflow-y-auto">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Institutional Analysis</h4>
                        {onRetry && !isLoading && (
                          <button 
                            onClick={onRetry}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground transition-colors group"
                            title="Re-run Analysis"
                          >
                            <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                          </button>
                        )}
                     </div>
                     
                     {isLoading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-primary/20 rounded-3xl bg-white/50 dark:bg-slate-900/50">
                           <motion.div
                             animate={{ rotate: 360 }}
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                             className="text-primary/40"
                           >
                             <Sparkles size={32} strokeWidth={1} />
                           </motion.div>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Running institutional <br /> compliance check...</p>
                        </div>
                     ) : error ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-rose-200 dark:border-rose-900/30 rounded-3xl bg-rose-50/50 dark:bg-rose-950/10">
                           <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                             <X size={20} strokeWidth={1.5} />
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Analysis Failed</p>
                             <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">{error}</p>
                             {onRetry && (
                               <button 
                                 onClick={onRetry}
                                 className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors mx-auto"
                               >
                                 <RefreshCcw size={12} />
                                 Try Again
                               </button>
                             )}
                           </div>
                        </div>
                     ) : (
                       <div className="space-y-6">
                         {score !== undefined && score !== null && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-border shadow-sm text-center relative overflow-hidden group"
                           >
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                               <Sparkles size={64} />
                             </div>
                             <div className="relative">
                                <span className={cn(
                                  "text-5xl font-black tracking-tighter",
                                  score > 80 ? "text-emerald-500" : score > 60 ? "text-amber-500" : "text-rose-500"
                                )}>
                                  {score}
                                </span>
                                <sub className="text-muted-foreground text-xs font-bold ml-1">/ 100</sub>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Institutional Readiness Score</p>
                             </div>
                           </motion.div>
                         )}

                         {(impactFeedback || atsFeedback) && (
                           <div className="grid grid-cols-1 gap-3">
                             {impactFeedback && (
                               <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                                 <h5 className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Impact Analysis</h5>
                                 <p className="text-[11px] text-muted-foreground leading-relaxed">{impactFeedback}</p>
                               </div>
                             )}
                             {atsFeedback && (
                               <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20">
                                 <h5 className="text-[9px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-1">ATS Optimization</h5>
                                 <p className="text-[11px] text-muted-foreground leading-relaxed">{atsFeedback}</p>
                               </div>
                             )}
                           </div>
                         )}

                         {suggestions.length > 0 && (
                           <div className="space-y-3">
                             <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Actionable Suggestions</h4>
                             <div className="space-y-3">
                                {suggestions.map((s, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-border shadow-sm text-xs text-muted-foreground font-light leading-relaxed relative pl-10"
                                  >
                                     <div className="absolute left-4 top-4 w-1.5 h-1.5 rounded-full bg-primary/40" />
                                     {s}
                                  </motion.div>
                                ))}
                             </div>
                           </div>
                         )}

                         {!suggestions.length && !score && !isLoading && (
                           <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-3xl">
                              <p className="text-[10px] text-muted-foreground/30 font-medium uppercase leading-relaxed">No active institutional <br /> issues detected</p>
                           </div>
                         )}
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
