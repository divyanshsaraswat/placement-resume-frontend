"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);

  const handleConfirm = async () => {
    setInternalLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setInternalLoading(false);
    }
  };

  const activeLoading = isLoading || internalLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={activeLoading ? undefined : onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800"
          >
            {/* Header / Icon */}
            <div className="p-8 pb-4 flex flex-col items-center text-center space-y-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                variant === "danger" ? "bg-primary text-white shadow-primary/20" :
                variant === "warning" ? "bg-slate-800 dark:bg-slate-900 text-white shadow-slate-900/10" :
                "bg-primary text-white shadow-primary/20"
              )}>
                <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium leading-relaxed px-2">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 pt-4 flex flex-col gap-2">
              <button
                disabled={activeLoading}
                onClick={handleConfirm}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg",
                  variant === "danger" ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20" :
                  variant === "warning" ? "bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/20" :
                  "bg-primary hover:bg-primary/90 text-white shadow-primary/20",
                  activeLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {activeLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                {activeLoading ? "Processing..." : confirmText}
              </button>
              
              <button
                disabled={activeLoading}
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                {cancelText}
              </button>
            </div>
            
            <button 
              disabled={activeLoading}
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-300 hover:text-slate-600 disabled:opacity-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
