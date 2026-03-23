"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  RotateCw, 
  Printer,
  Maximize2,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerProps {
  url: string;
  format: string;
  onRecompile?: () => void;
}

export function DocumentViewer({ url, format, onRecompile }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const { theme, resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDist = useRef<number | null>(null);
  const initialScale = useRef<number>(1.0);
  const wasPinching = useRef(false);
  const isDark = theme === "dark" || resolvedTheme === "dark";

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    toast.info("Preparing document for print...");
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchStartDist.current = dist;
      initialScale.current = scale;
      wasPinching.current = true;
    } else {
      wasPinching.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const newScale = initialScale.current * (dist / touchStartDist.current);
      // Limits scale between 0.5 and 2.5
      setScale(Math.min(Math.max(newScale, 0.5), 2.5));
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
    // Keep wasPinching true for a short moment to prevent onClick
    setTimeout(() => {
      wasPinching.current = false;
    }, 100);
  };

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
          <button 
            onClick={handleDownload}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Download &amp; Review
          </button>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <CheckCircle size={10} />
            Stored in Institutional Vault
          </p>
        </div>
      </motion.div>
    );
  }

  // Premium PDF Viewer with react-pdf
  return (
    <div 
      className="w-full h-full relative group bg-slate-50 dark:bg-slate-950 flex flex-col min-h-0 overflow-hidden rounded-3xl border border-border/50 shadow-2xl"
      onClick={() => {
        if (!wasPinching.current) {
          setShowToolbar(!showToolbar);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Premium Floating Toolbar */}
      <div className={cn(
        "absolute top-3 left-1/2 -translate-x-1/2 z-20 w-max max-w-[95%] px-1.5 py-1 md:py-2.5 md:px-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl shadow-2xl flex items-center justify-center gap-0.5 md:gap-4 transition-all duration-300"
      )}
      onClick={(e) => e.stopPropagation()}
      >
        
        {/* Navigation */}
        <div className="flex items-center gap-0.5 md:gap-2 pr-0.5 md:pr-4 border-r border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
            disabled={pageNumber <= 1}
            className="p-1 md:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
             <span className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white">{pageNumber}</span>
             <span className="hidden xs:inline text-[9px] text-slate-400 font-bold">/</span>
             <span className="hidden xs:inline text-[9px] text-slate-400 font-bold">{numPages || "--"}</span>
          </div>
          <button 
            onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || prev))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 md:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom & Transform */}
        <div className="flex items-center gap-0.5 md:gap-2 pr-1 md:pr-4 border-r border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
            className="p-1 md:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
            <Minus size={16} />
          </button>
          <span className="text-[9px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 min-w-[2.2rem] md:min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(prev => Math.min(prev + 0.1, 2.5))}
            className="p-1 md:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="hidden sm:flex p-1 md:p-2 ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={handlePrint}
            title="Print Document"
            className="hidden sm:flex p-1.5 md:p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
            <Printer size={16} />
          </button>
          <button 
            onClick={handleDownload}
            title="Download PDF"
            className="p-1.5 md:p-2.5 rounded-lg bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Download size={16} />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in New Tab"
            className="hidden lg:flex p-1.5 md:p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-slate-100/50 dark:bg-slate-900/50 p-6 md:p-12 scroll-smooth"
      >
        <div className="flex justify-center min-h-full">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center space-y-4 p-20">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decoding Document...</p>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center space-y-4 p-20 text-center">
                <FileText size={48} className="text-rose-400" />
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Build Error</p>
                    <p className="text-xs text-slate-500">Could not render the institutional build. Please recompile.</p>
                  </div>
                  {onRecompile && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRecompile(); }}
                      className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Recompile Now
                    </button>
                  )}
                </div>
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${pageNumber}-${rotation}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-lg overflow-hidden border border-border/40"
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="max-w-full"
                  width={containerRef.current ? (containerRef.current.clientWidth < 640 ? containerRef.current.clientWidth - 32 : containerRef.current.clientWidth - 100) : undefined}
                />
              </motion.div>
            </AnimatePresence>
          </Document>
        </div>
      </div>

      {/* Page Scroll Progress */}
      {numPages && (
        <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full z-10 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(pageNumber / numPages) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
