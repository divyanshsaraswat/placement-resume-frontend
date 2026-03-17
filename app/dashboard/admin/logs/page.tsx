"use client";

import { History, Search, Download, Clock, Activity, Target, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "auth" | "resume" | "validation" | "user";
}

const mockLogs: AuditLog[] = [
  { id: "l1", actor: "Dr. Ankit Negi", action: "APPROVED_RESUME", target: "Aditya Sharma (v2)", timestamp: "2024-03-17 14:30", type: "validation" },
  { id: "l2", actor: "System Admin", action: "ROLE_UPDATED", target: "Ishita Gupta (SPC)", timestamp: "2024-03-17 13:15", type: "user" },
  { id: "l3", actor: "Rahul Verma", action: "UPLOADED_RESUME", target: "Marketing_v1.pdf", timestamp: "2024-03-17 12:45", type: "resume" },
  { id: "l4", actor: "Divyansh S", action: "LOGIN_SUCCESS", target: "192.168.1.1", timestamp: "2024-03-17 10:20", type: "auth" },
  { id: "l5", actor: "Vikram Singh", action: "REJECTED_RESUME", target: "Sanya M (v1)", timestamp: "2024-03-17 09:50", type: "validation" },
];

export default function AuditLogsPage() {
  const typeStyles = {
    auth: "bg-blue-500/10 text-blue-500",
    resume: "bg-purple-500/10 text-purple-500",
    validation: "bg-emerald-500/10 text-emerald-500",
    user: "bg-amber-500/10 text-amber-500",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold text-primary">Audit Pipeline</h1>
          <p className="text-muted-foreground font-light text-lg">Real-time system-wide activity monitoring and security logging.</p>
        </div>
        <button className="nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm text-primary font-medium hover:nm-inset transition-all">
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
            <p className="text-3xl font-display font-bold">+128 <span className="text-xs text-emerald-500 font-bold ml-1">↑ 12%</span></p>
         </div>

         <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
            <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
               <Target size={24} />
            </div>
            <h3 className="font-semibold">Top Action</h3>
            <p className="text-3xl font-display font-bold">RESUME_VAL</p>
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
           />
        </div>

        <div className="space-y-6">
           {mockLogs.map((log, i) => (
             <motion.div 
               key={log.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="flex items-center gap-8 p-6 nm-convex rounded-3xl group hover:nm-inset transition-all"
             >
                <div className="w-14 text-center shrink-0">
                   <p className="text-[10px] font-bold text-muted-foreground opacity-30 leading-tight">
                     {log.timestamp.split(' ')[1]}
                   </p>
                   <p className="text-xs font-bold text-muted-foreground leading-tight">
                     {log.timestamp.split(' ')[0].split('-')[2]} MAR
                   </p>
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                      <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter", typeStyles[log.type])}>
                        {log.type}
                      </span>
                      <p className="font-bold text-sm truncate">{log.actor}</p>
                   </div>
                   <p className="text-xs font-light text-muted-foreground">
                      {log.action.replace('_', ' ')} <span className="font-bold text-primary mx-1">→</span> {log.target}
                   </p>
                </div>

                <div className="hidden sm:flex nm-inset p-2 rounded-xl text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
                   <History size={16} />
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
