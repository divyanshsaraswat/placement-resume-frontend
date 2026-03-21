"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, MessageSquare, Bot, RefreshCcw, Copy, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { resumeApi } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

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
  resumeContent?: string;
  format?: string;
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
  onRetry,
  resumeContent,
  format = "latex"
}: AIDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: `Hello! I'm your institutional AI companion. How can I help refine your ${format === 'latex' ? 'LaTeX ' : ''}resume today?`.replace('  ', ' ')
    }
  ]);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"analysis" | "chat">("analysis");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only set default if it's the first time drawer is opening in this session or after score changes
    // But user says: "By-default keep the active tab to analysis."
    // And "refreshing the analysis shouldn't change the tab to assistant (chat)"
    // So the previous useEffect was causing the unwanted behavior.
  }, [isOpen]);

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
            let nextContent = newMsgs[lastIdx].content + chunk;
            // Post-process to remove LaTeX mentions if not in LaTeX mode
            if (format !== 'latex') {
              nextContent = nextContent.replace(/latex\s+resume/gi, 'resume');
              nextContent = nextContent.replace(/latex\s+code/gi, 'content');
              nextContent = nextContent.replace(/latex/gi, 'document');
            }
            newMsgs[lastIdx] = { 
              ...newMsgs[lastIdx], 
              content: nextContent 
            };
          }
          return newMsgs;
        });
      }, resumeContent, format);
    } catch (err: any) {
      let errorMsg = "I encountered an error while processing your request. Please try again or check your connectivity.";
      if (err.response?.status === 402) {
        errorMsg = "⚠️ **Institutional Rate Limit Reached**: Your hourly LLM credits have been exhausted. Please wait for the next refill (refills happen every hour) or check your usage in Settings.";
      }
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "ai", content: errorMsg }
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
            className="fixed bottom-0 left-0 right-0 h-[95vh] md:h-[90vh] bg-background border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-[70] flex flex-col rounded-t-[2.5rem] md:rounded-t-[3rem] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 md:px-10 py-5 md:py-6 border-b border-border/50 flex items-center justify-between bg-primary/[0.02] shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Sparkles size={18} className="md:w-5 md:h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold tracking-tight">Institutional AI Assistant</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      error ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
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

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center justify-center p-4 border-b border-border/50 bg-white/50 dark:bg-slate-900/50 shrink-0">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full max-w-sm border border-border/50 shadow-inner">
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      activeTab === "analysis" 
                        ? "bg-white dark:bg-slate-700 text-primary shadow-lg shadow-black/5" 
                        : "text-muted-foreground hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                      activeTab === "chat" 
                        ? "bg-white dark:bg-slate-700 text-primary shadow-lg shadow-black/5" 
                        : "text-muted-foreground hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    Chat
                  </button>
               </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
               {/* Messages Area */}
               <div className={cn(
                 "flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300",
                 activeTab !== "chat" ? "hidden md:flex" : "flex"
               )}>
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-10 space-y-5 md:space-y-6 scrollbar-hide"
                  >
                    {messages.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={cn(
                          "flex gap-4 max-w-[85%] sm:max-w-[80%] md:max-w-[750px] lg:max-w-[850px]",
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
                            "px-5 py-3.5 rounded-[1.5rem] text-sm leading-relaxed max-w-full overflow-hidden break-words",
                            msg.role === "ai" 
                              ? "bg-slate-50 dark:bg-slate-900 border border-border/40 text-foreground shadow-sm"
                              : "bg-primary text-white font-medium"
                          )}>
                            {msg.role === "ai" ? (
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-600 dark:text-slate-400">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1.5 font-light">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1.5 font-light">{children}</ol>,
                                  li: ({ children }) => <li className="pl-1 text-slate-600 dark:text-slate-400">{children}</li>,
                                  code: ({ children, className }) => {
                                    const codeStr = String(children).replace(/\n$/, '');
                                    const isBlock = codeStr.includes('\n') || (className && className.startsWith('language-')) || codeStr.length > 50;
                                    if (isBlock) {
                                      return (
                                        <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700/50 group">
                                          <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{className?.replace('language-', '') || 'code'}</span>
                                            <CopyButton text={codeStr} />
                                          </div>
                                          <pre className="overflow-x-auto p-4 bg-slate-950 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all scrollbar-hide"><code>{codeStr}</code></pre>
                                        </div>
                                      );
                                    }
                                    return <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-mono">{children}</code>;
                                  },
                                  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                                  h1: ({ children }) => <h1 className="text-sm font-bold mt-4 mb-2 text-slate-900 dark:text-slate-100">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-xs font-bold mt-3 mb-1.5 text-slate-900 dark:text-slate-100">{children}</h2>,
                                }}
                              >
                                {(() => {
                                  let text = msg.content;
                                  // Detect long inline code that should be a block (e.g. `latex \documentclass...`)
                                  // We split 'latex' from the content with a newline for proper MD formatting
                                  text = text.replace(/(`)latex\s+([^\n`]{30,})(`)/gi, '\n\n```latex\n$2\n```\n\n');
                                  // Insert newlines before inline list markers like "* Item" not already at start of line
                                  text = text.replace(/([^\n])\* /g, '$1\n\n* ');
                                  // Split inline numbered list items
                                  text = text.replace(/([^\n])(\d+\. )/g, '$1\n\n$2');
                                  // Insert newlines before headers
                                  text = text.replace(/([^\n])(#{1,6} )/g, '$1\n\n$2');
                                  return text;
                                })()}
                              </ReactMarkdown>
                            ) : (
                              msg.content
                            )}
                          </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 md:p-8 pt-0">
                     <div className="bg-slate-50 dark:bg-slate-900 border border-border/60 rounded-[1.8rem] md:rounded-[2rem] p-1.5 md:p-2 pl-4 md:pl-6 flex items-center gap-2 shadow-inner focus-within:border-primary/50 transition-colors">
                        <input 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Ask anything about your resume standards..."
                          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 md:py-3 outline-none"
                        />
                        <button 
                          onClick={handleSend}
                          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                          <Send size={15} />
                        </button>
                     </div>
                   </div>
               </div>

                <div className={cn(
                  "w-full h-full md:w-[380px] lg:w-[420px] md:border-l border-border/50 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto shrink-0 transition-all duration-300 custom-scrollbar",
                  activeTab !== "analysis" ? "hidden md:block" : "block"
                )}>
                  <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Institutional Analysis</h4>
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
                        <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-primary/20 rounded-2xl md:rounded-3xl bg-white/50 dark:bg-slate-900/50">
                           <motion.div
                             animate={{ rotate: 360 }}
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                             className="text-primary/40"
                           >
                             <Sparkles size={28} strokeWidth={1} />
                           </motion.div>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Running institutional <br /> compliance check...</p>
                        </div>
                     ) : error ? (
                        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-rose-200 dark:border-rose-900/30 rounded-2xl md:rounded-3xl bg-rose-50/50 dark:bg-rose-950/10">
                           <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500">
                             <X size={18} strokeWidth={1.5} />
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
                       <div className="space-y-5 md:space-y-6">
                         {score !== undefined && score !== null && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[1.8rem] md:rounded-[2rem] border border-border shadow-sm text-center relative overflow-hidden group"
                           >
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                               <Sparkles size={48} className="md:w-16 md:h-16" />
                             </div>
                             <div className="relative">
                                <span className={cn(
                                  "text-4xl md:text-5xl font-black tracking-tighter",
                                  score > 80 ? "text-emerald-500" : score > 60 ? "text-amber-500" : "text-rose-500"
                                )}>
                                  {score}
                                </span>
                                <sub className="text-muted-foreground text-[10px] md:text-xs font-bold ml-1">/ 100</sub>
                                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-2">Institutional Readiness Score</p>
                             </div>
                           </motion.div>
                         )}

                         {(impactFeedback || atsFeedback) && (
                           <div className="grid grid-cols-1 gap-3">
                             {impactFeedback && (
                               <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                                 <h5 className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">Impact Analysis</h5>
                                 <div className="text-[11px] text-muted-foreground leading-relaxed max-w-none">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm, remarkBreaks]}
                                      components={{
                                        strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                      }}
                                    >
                                      {impactFeedback.replace(/([^\n])\* /g, '$1\n\n* ').replace(/([^\n])(\d+\. )/g, '$1\n\n$2')}
                                    </ReactMarkdown>
                                 </div>
                               </div>
                             )}
                             {atsFeedback && (
                               <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20">
                                 <h5 className="text-[9px] font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest mb-1">ATS Optimization</h5>
                                 <div className="text-[11px] text-muted-foreground leading-relaxed max-w-none">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm, remarkBreaks]}
                                      components={{
                                        strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                        li: ({ children }) => <li className="pl-1">{children}</li>,
                                      }}
                                    >
                                      {atsFeedback.replace(/([^\n])\* /g, '$1\n\n* ').replace(/([^\n])(\d+\. )/g, '$1\n\n$2')}
                                    </ReactMarkdown>
                                 </div>
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
                                    className="bg-white dark:bg-slate-900/50 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-border shadow-sm text-[11px] md:text-xs text-muted-foreground font-light leading-relaxed relative pl-9 md:pl-10"
                                  >
                                     <div className="absolute left-3.5 md:left-4 top-4 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary/40" />
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkBreaks]}
                                        components={{
                                          p: ({children}) => <p className="mb-1 last:mb-0 text-[11px] md:text-xs text-muted-foreground">{children}</p>,
                                          ul: ({children}) => <ul className="list-disc ml-4 mb-1 space-y-0.5 text-[11px] md:text-xs">{children}</ul>,
                                          li: ({children}) => <li className="pl-1 text-muted-foreground">{children}</li>,
                                          strong: ({children}) => <strong className="font-semibold text-slate-800 dark:text-slate-200">{children}</strong>,
                                        }}
                                      >
                                        {s.replace(/([^\n])\* /g, '$1\n\n* ').replace(/([^\n])(\d+\. )/g, '$1\n\n$2')}
                                      </ReactMarkdown>
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
