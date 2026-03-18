"use client";

import { motion } from "framer-motion";
import { FileText, Download, CheckCircle } from "lucide-react";

interface DocumentViewerProps {
  url: string;
  format: string;
}

export function DocumentViewer({ url, format }: DocumentViewerProps) {
  if (format === "docx") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full rounded-3xl bg-white dark:bg-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.1)] border border-border/60 flex flex-col items-center justify-center p-12 text-center space-y-8"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FileText size={48} strokeWidth={1.5} />
        </div>
        <div className="space-y-3 max-w-sm">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Word Document Vaulted</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            This document is securely stored in the Institutional Repository. Download it to review in Microsoft Word or compatible software.
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <a 
            href={url} 
            download 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Download &amp; Review
          </a>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <CheckCircle size={10} />
            Stored in Institutional Vault
          </p>
        </div>
      </motion.div>
    );
  }

  // PDF: use native browser rendering via <object> tag (most reliable)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-black/5 bg-white"
    >
      <object
        data={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
        type="application/pdf"
        className="w-full h-full"
      >
        {/* Fallback if browser can't render PDF inline */}
        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-50 dark:bg-slate-900">
          <FileText size={48} strokeWidth={1} className="text-slate-400" />
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">PDF Preview Unavailable</p>
            <p className="text-xs text-slate-500">Your browser cannot display this PDF inline.</p>
          </div>
          <a 
            href={url}
            download
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
          >
            Download PDF
          </a>
        </div>
      </object>
    </motion.div>
  );
}
