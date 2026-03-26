"use client";

import { useState, useEffect, useCallback } from "react";
import { History, Search, Download, Clock, Activity, Target, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  target: string;
  timestamp: string;
  log_type: "auth" | "resume" | "validation" | "user";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const fetchLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const [history, statistics] = await Promise.all([
        adminApi.getLogs({ search: debouncedSearch, limit: 50 }, signal),
        adminApi.getLogStats(signal),
      ]);
      setLogs(history);
      setStats(statistics);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error(err);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs(controller.signal);
    return () => controller.abort();
  }, [fetchLogs]);

  const handleExport = async () => {
    const toastId = toast.loading("Preparing CSV export...");
    try {
      const blob = await adminApi.exportLogs({ search: debouncedSearch });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Audit logs exported successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export logs", { id: toastId });
    }
  };

  const typeStyles = {
    auth: "bg-blue-500/10 text-blue-500",
    resume: "bg-purple-500/10 text-purple-500",
    validation: "bg-emerald-500/10 text-emerald-500",
    user: "bg-amber-500/10 text-amber-500",
    ai: "bg-rose-500/10 text-rose-500",
    latex: "bg-indigo-500/10 text-indigo-500",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-primary">Audit Pipeline</h1>
          <p className="text-sm text-muted-foreground font-light">Real-time system-wide activity monitoring and security logging.</p>
        </div>
        <button 
          onClick={handleExport}
          className="nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm text-primary font-medium hover:nm-inset transition-all"
        >
           <Download size={18} />
           Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
            <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
               <Activity size={24} />
            </div>
            <h3 className="font-semibold">Event Frequency</h3>
            <p className="text-3xl font-display font-bold">
              {stats?.total_events || 0}
              <span className="text-xs text-emerald-500 font-bold ml-1">↑ Active</span>
            </p>
         </div>

         <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
            <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
               <Target size={24} />
            </div>
            <h3 className="font-semibold">Top Action</h3>
            <p className="text-3xl font-display font-bold truncate">{stats?.top_action || "N/A"}</p>
         </div>

         <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
            <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
               <ShieldCheck size={24} />
            </div>
            <h3 className="font-semibold">Security State</h3>
            <p className="text-3xl font-display font-bold text-emerald-500 uppercase">Secure</p>
         </div>
      </div>

      <div className="nm-flat rounded-[3rem] p-10 overflow-hidden">
        <div className="flex items-center gap-4 nm-inset rounded-3xl px-8 py-4 mb-10 max-w-xl">
           <Search size={20} className="text-muted-foreground" />
           <input 
             type="text" 
             placeholder="Search activity logs..." 
             className="bg-transparent border-none outline-none text-sm w-full"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        <div className="space-y-6 relative min-h-[400px]">
           {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-3xl">
                <Loader2 className="animate-spin text-primary" size={40} />
             </div>
           )}

           <AnimatePresence mode="popLayout">
             {logs.length === 0 && !isLoading ? (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="h-64 flex flex-col items-center justify-center text-muted-foreground/30"
               >
                 <Clock size={64} strokeWidth={0.5} />
                 <p className="text-lg font-light">No activity logs found</p>
               </motion.div>
             ) : (
               logs.map((log, i) => (
                 <motion.div 
                   key={log.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ delay: i * 0.05 }}
                   className="flex items-center gap-8 p-6 nm-convex rounded-3xl group hover:nm-inset transition-all"
                 >
                    <div className="w-16 text-center shrink-0">
                       <p className="text-[10px] font-bold text-muted-foreground opacity-30 leading-tight">
                         {format(new Date(log.timestamp), "HH:mm")}
                       </p>
                       <p className="text-[10px] font-bold text-muted-foreground leading-tight uppercase">
                         {format(new Date(log.timestamp), "dd MMM")}
                       </p>
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter", typeStyles[log.log_type] || "bg-slate-500/10 text-slate-500")}>
                            {log.log_type}
                          </span>
                          <p className="font-bold text-sm truncate">{log.actor_name}</p>
                       </div>
                       <p className="text-xs font-light text-muted-foreground truncate">
                          {log.action.replace(/_/g, ' ')} <span className="font-bold text-primary mx-1">→</span> {log.target}
                       </p>
                    </div>

                    <div className="hidden sm:flex nm-inset p-2 rounded-xl text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                       <History size={16} />
                    </div>
                 </motion.div>
               ))
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
