"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockValidationQueue } from "@/types/resume";
import { 
  ChevronLeft, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  AlertTriangle,
  Send,
  User,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ResumeReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const resume = mockValidationQueue.find(r => r.id === id);

  if (!resume) return <div className="p-8 text-center">Resume not found</div>;

  const handleAction = async (status: "approved" | "rejected") => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/faculty/validate");
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Review Toolbar */}
      <div className="flex justify-between items-center px-4 py-3 nm-flat rounded-2xl bg-background">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="nm-convex p-2.5 rounded-xl text-muted-foreground hover:nm-inset transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="nm-inset w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold">
              {resume.studentName?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{resume.studentName}</h2>
              <p className="text-xs text-muted-foreground">{resume.type} Resume • {resume.department}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 nm-inset px-4 py-2 rounded-xl">
             <Sparkles size={16} className="text-primary" />
             <span className="text-sm font-medium">AI Score: {resume.score}%</span>
          </div>
          <button 
            onClick={() => handleAction("rejected")}
            disabled={isSubmitting}
            className="nm-convex px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium text-rose-500 hover:nm-inset transition-all disabled:opacity-50"
          >
            <XCircle size={18} />
            Reject
          </button>
          <button 
            onClick={() => handleAction("approved")}
            disabled={isSubmitting}
            className="nm-primary px-8 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all disabled:opacity-50"
          >
            <CheckCircle size={18} />
            Approve & Sign
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* PDF Resume Preview (Left) */}
        <div className="flex-1 nm-inset rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 bg-background/50 border-b border-white/5 flex justify-between items-center">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Document Preview</span>
             <button className="text-primary flex items-center gap-1 text-[10px] font-bold hover:underline">
               OPEN FULLSCREEN <ExternalLink size={10} />
             </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
             <div className="w-full max-w-2xl aspect-[1/1.414] bg-white shadow-2xl rounded-sm flex flex-col p-12 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="h-10 w-1/2 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-1 w-full bg-slate-300 rounded mt-8" />
                <div className="space-y-4 pt-4">
                  <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  <div className="h-2 w-full bg-slate-50 rounded" />
                   <div className="h-2 w-5/6 bg-slate-50 rounded" />
                </div>
                <div className="space-y-4 pt-4">
                  <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  <div className="h-2 w-full bg-slate-50 rounded" />
                   <div className="h-2 w-4/6 bg-slate-50 rounded" />
                </div>
             </div>
          </div>
        </div>

        {/* Remarks & AI Panel (Right) */}
        <div className="w-[450px] flex flex-col gap-6 overflow-auto pr-2">
          {/* AI Content Breakdown */}
          <div className="nm-flat rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} />
                <h4 className="font-semibold text-sm uppercase tracking-widest text-primary">AI Content Audit</h4>
             </div>
             
             <div className="space-y-4">
                {[
                  { label: "formatting", score: 95, icon: FileText },
                  { label: "impact keywords", score: 42, icon: AlertTriangle, warning: true },
                  { label: "skill coverage", score: 78, icon: CheckCircle },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                       <span className="text-muted-foreground">{item.label}</span>
                       <span className={item.warning ? "text-rose-500" : "text-emerald-500"}>{item.score}%</span>
                     </div>
                     <div className="h-1.5 w-full nm-inset rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.score}%` }}
                         className={cn("h-full", item.warning ? "bg-rose-500" : "bg-emerald-500")}
                       />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Remarks Section */}
          <div className="flex-1 nm-flat rounded-[2.5rem] p-8 flex flex-col space-y-6">
             <div className="flex items-center gap-2 text-primary">
                <MessageSquare size={18} />
                <h4 className="font-semibold text-sm uppercase tracking-widest">Review Remarks</h4>
             </div>

             <div className="flex-1 nm-inset rounded-3xl p-6 relative">
                 <textarea 
                   value={remark}
                   onChange={(e) => setRemark(e.target.value)}
                   className="w-full h-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-muted-foreground/30"
                   placeholder="Type your feedback or remarks here..."
                 />
                 <div className="absolute bottom-4 right-4 text-[10px] font-bold text-muted-foreground/20">
                   AUTO-SAVING REMARKS
                 </div>
             </div>

             <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {["Excellent Resume", "Quantify Impact", "Improve Formatting"].map(chip => (
                    <button 
                      key={chip}
                      onClick={() => setRemark(chip)}
                      className="nm-convex px-4 py-2 rounded-xl text-[10px] font-semibold hover:nm-inset transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
