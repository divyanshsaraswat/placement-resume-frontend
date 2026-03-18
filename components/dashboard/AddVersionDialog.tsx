"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, FileCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddVersionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentFormat: string;
  currentType: string;
  onAddVersion: (resumeId: string, type: string, latexCode: string, format: string, file?: File) => Promise<void>;
}

export function AddVersionDialog({ isOpen, onClose, resumeId, currentFormat, currentType, onAddVersion }: AddVersionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [format, setFormat] = useState(currentFormat);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum allowed size is 10MB.");
        return;
      }
      setSelectedFile(file);
      // Auto-detect format from file extension
      if (file.name.endsWith('.pdf')) setFormat('pdf');
      else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) setFormat('docx');
    }
  };

  const handleSubmit = async () => {
    if (format !== 'latex' && !selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddVersion(resumeId, currentType, "", format, selectedFile || undefined);
      toast.success("New version added successfully!");
      onClose();
      setSelectedFile(null);
    } catch (err) {
      toast.error("Failed to add version.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setSelectedFile(null);
      setFormat(currentFormat);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[20%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl z-[101] overflow-hidden border border-border/50"
          >
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Add New Version</h2>
                <p className="text-xs text-slate-400 font-medium">Upload an updated document for "{currentType}"</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'latex', label: 'LaTeX', icon: FileCode },
                    { id: 'pdf', label: 'PDF', icon: FileText },
                    { id: 'docx', label: 'DOCX', icon: FileText },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setFormat(fmt.id);
                        if (fmt.id === 'latex') setSelectedFile(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all text-center",
                        format === fmt.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <fmt.icon size={20} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{fmt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload (for PDF/DOCX) */}
              {format !== 'latex' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={format === 'pdf' ? '.pdf' : '.doc,.docx'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center gap-3",
                      selectedFile
                        ? "border-primary/40 bg-primary/5"
                        : "border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {selectedFile ? (
                      <>
                        <FileText size={24} className="text-primary" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[250px]">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-slate-400" />
                        <div className="text-center">
                          <p className="text-xs font-medium text-slate-500">Click to select {format.toUpperCase()} file</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Max 10MB</p>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              )}

              {format === 'latex' && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                    A new LaTeX version will be created from your current code. You can edit it in the document editor after creation.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (format !== 'latex' && !selectedFile)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Add Version"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
