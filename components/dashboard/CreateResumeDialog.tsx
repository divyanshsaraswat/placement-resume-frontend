"use client";

import { useState } from "react";
import { Plus, X, Sparkles, FileText, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: string, template: string) => Promise<void>;
}

const TEMPLATES = [
  {
    id: "sde",
    name: "SDE / Software Engineer",
    description: "Optimized for tech roles with skills and projects focus.",
    icon: <Sparkles className="text-secondary" />,
    latex: `\\documentclass[a4paper,10pt]{article}
\\usepackage{fullpage}
\\usepackage{titlesec}
\\begin{document}
\\begin{center}
    {\\huge \\bf Your Name} \\\\
    Email: your@email.com | GitHub: github.com/username
\\end{center}
\\section*{Education}
MNIT Jaipur - B.Tech in Computer Science
\\section*{Experience}
Role at Company - Responsibility 1
\\section*{Projects}
Project Name - Key Tech Used
\\end{document}`,
  },
  {
    id: "core",
    name: "Core / Analytics",
    description: "Balanced layout for core engineering and data roles.",
    icon: <FileText className="text-primary" />,
    latex: `\\documentclass[a4paper,10pt]{article}
\\begin{document}
\\begin{center}
    {\\huge \\bf Your Name}
\\end{center}
\\section*{Objective}
Seeking a challenging role in Core Engineering.
\\end{document}`,
  }
];

export function CreateResumeDialog({ isOpen, onClose, onCreate }: CreateResumeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setIsSubmitting(true);
    try {
      await onCreate(name, selectedTemplate.latex);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-background border-4 border-black dark:border-white rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)]"
          >
            {/* Header */}
            <div className="bg-primary/5 p-8 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                  <Plus size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Initialize Version</h2>
                  <p className="text-sm text-muted-foreground font-light">Create a new professional document version.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
              {/* Version Name */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Version Descriptor</label>
                <input 
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SDE_Google_Ready"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border/50 p-5 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/30"
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Starter Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TEMPLATES.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={cn(
                        "cursor-pointer border-2 p-6 rounded-2xl transition-all group relative overflow-hidden",
                        selectedTemplate.id === t.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border/40 bg-white dark:bg-slate-900 hover:border-border hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {selectedTemplate.id === t.id && (
                        <div className="absolute top-0 right-0 p-2 text-primary">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl group-hover:scale-110 transition-transform">
                          {t.icon}
                        </div>
                        <h4 className="font-semibold tracking-tight">{t.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-4 rounded-full border border-border/50 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !name}
                  className="flex-[2] btn-primary"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">Processing... <Loader2 className="w-4 h-4 animate-spin" /></span>
                  ) : (
                    <span className="flex items-center gap-2">Create & Edit <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
