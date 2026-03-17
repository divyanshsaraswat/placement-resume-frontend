"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, MessageSquare, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
}

export function AIDrawer({ isOpen, onClose, suggestions }: AIDrawerProps) {
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

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");

    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "I've analyzed your request. Based on MNIT institutional standards, I recommend emphasizing your technical certifications in the header section." 
      }]);
    }, 1000);
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
            className="fixed bottom-0 left-0 right-0 h-[60vh] bg-background border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-[70] flex flex-col rounded-t-[3rem] overflow-hidden"
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
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Intelligence Engine</span>
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
                          "flex gap-4 max-w-[85%]",
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
                             ? "bg-slate-50 dark:bg-slate-900 border border-border/40 text-foreground shadow-sm"
                             : "bg-primary text-white font-medium"
                         )}>
                           {msg.content}
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

               {/* Quick Insights Sidebar */}
               <div className="w-[380px] border-l border-border/50 bg-slate-50/50 dark:bg-slate-950/30 p-8 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Live Review Findings</h4>
                     {suggestions.length > 0 ? (
                       <div className="space-y-3">
                          {suggestions.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-border shadow-sm text-xs text-muted-foreground font-light leading-relaxed">
                               {s}
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="p-8 text-center border-2 border-dashed border-border/40 rounded-3xl">
                          <p className="text-[10px] text-muted-foreground/30 font-medium uppercase leading-relaxed">No active institutional <br /> issues detected</p>
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
