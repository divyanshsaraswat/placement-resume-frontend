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
    icon: Sparkles,
    colorClass: "text-secondary",
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
    icon: FileText,
    colorClass: "text-primary",
    latex: `\\documentclass[a4paper,10pt]{article}
\\begin{document}
\\begin{center}
    {\\huge \\bf Your Name}
\\end{center}
\\section*{Objective}
Seeking a challenging role in Core Engineering.
\\end{document}`,
  },
  {
    id: "custom",
    name: "Custom / Scratch",
    description: "Start with a minimal LaTeX structure and build it your way.",
    icon: Plus,
    colorClass: "text-slate-400",
    latex: `\\documentclass[a4paper,10pt]{article}
\\begin{document}
\\begin{center}
    {\\huge \\bf Your Name}
\\end{center}
\\end{document}`,
  }
];

export function CreateResumeDialog({ isOpen, onClose, onCreate }: CreateResumeDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [name, setName] = useState("");
  const [customType, setCustomType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setIsSubmitting(true);
    try {
      const finalType = selectedTemplate.id === 'custom' ? (customType || "Custom Resume") : selectedTemplate.name;
      await onCreate(name, selectedTemplate.latex);
      // Note: The onCreate in StudentDashboard only takes (type, template)
      // We are passing 'name' as type for now based on current handleCreateResume implementation
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">New Version</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium tracking-tight">Define your next professional milestone.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-300 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Version Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Descriptor</label>
                <div className="relative group">
                  <input 
                    autoFocus
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Senior_SDE_Referral"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-0 border-b-2 border-slate-100 dark:border-slate-800 p-5 rounded-t-2xl text-base font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                    <FileText size={18} />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Strategy</label>
                <div className="flex flex-col gap-3">
                  {TEMPLATES.map((t) => (
                    <div key={t.id} className="space-y-3">
                      <motion.div 
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTemplate(t)}
                        className={cn(
                          "cursor-pointer border-2 p-4 rounded-2xl transition-all flex items-center gap-4 relative overflow-hidden",
                          selectedTemplate.id === t.id 
                            ? "border-primary bg-primary/[0.02] shadow-[0_8px_20px_rgba(37,99,235,0.06)]" 
                            : "border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950 hover:border-slate-200 dark:hover:border-slate-800"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                          selectedTemplate.id === t.id ? "bg-primary text-white" : "bg-slate-50 dark:bg-slate-900"
                        )}>
                          <t.icon 
                            size={20} 
                            className={cn(
                              "transition-colors",
                              selectedTemplate.id === t.id ? "text-white" : t.colorClass
                            )} 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-bold text-sm transition-colors",
                            selectedTemplate.id === t.id ? "text-primary dark:text-white" : "text-slate-800 dark:text-slate-200"
                          )}>{t.name}</h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {t.description}
                          </p>
                        </div>
                        {selectedTemplate.id === t.id && (
                          <motion.div 
                            layoutId="active-check"
                            className="bg-primary text-white p-1 rounded-full shrink-0"
                          >
                            <ChevronRight size={12} className="stroke-[3]" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Inline Custom Type Input */}
                      <AnimatePresence>
                        {selectedTemplate.id === "custom" && t.id === "custom" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden px-4"
                          >
                            <div className="relative group pt-1 pb-4">
                              <input 
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="Enter custom resume type... (e.g. Portfolio)"
                                className="w-full bg-slate-50 dark:bg-slate-900/30 border-0 border-b border-primary/30 p-3 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || !name}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none group"
                >
                  {isSubmitting ? (
                    <>Processing <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                    <>Initialize & Edit <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" /></>
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
