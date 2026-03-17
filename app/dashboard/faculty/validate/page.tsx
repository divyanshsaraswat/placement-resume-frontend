"use client";

import { mockValidationQueue } from "@/types/resume";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FacultyValidatePage() {
  const queue = mockValidationQueue;

  const statusColors = {
    approved: "text-emerald-500 bg-emerald-500/10",
    submitted: "text-amber-500 bg-amber-500/10",
    rejected: "text-rose-500 bg-rose-500/10",
    draft: "text-slate-500 bg-slate-500/10",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-bold text-primary">Validation Queue</h1>
        <p className="text-muted-foreground font-light text-lg">Review and approve student resumes for the placement season.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Pending", value: "12", icon: Clock, color: "text-amber-500" },
          { label: "Approved Today", value: "45", icon: CheckCircle, color: "text-emerald-500" },
          { label: "Avg. Score", value: "78%", icon: ArrowRight, color: "text-primary" },
          { label: "Flagged", value: "3", icon: XCircle, color: "text-rose-500" },
        ].map((stat, i) => (
          <div key={i} className="nm-flat p-6 rounded-3xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
              <p className="text-2xl font-display font-bold">{stat.value}</p>
            </div>
            <div className={cn("nm-inset p-3 rounded-xl", stat.color)}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="nm-flat rounded-[3rem] p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="w-full md:w-96 nm-inset px-6 py-3 rounded-2xl flex items-center gap-4">
            <Search size={18} className="text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search students, departments..." 
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
          <div className="flex gap-4">
             <button className="nm-convex px-6 py-3 rounded-2xl flex items-center gap-2 text-sm text-muted-foreground hover:nm-inset transition-all">
               <Filter size={18} />
               Department
             </button>
             <button className="nm-primary px-8 rounded-2xl text-xs sm:text-sm transition-all h-12 shadow-lg">
               Bulk Approve
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-2">Student</th>
                <th className="px-6 py-2">Details</th>
                <th className="px-6 py-2 text-center">AI Score</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item, i) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="nm-flat bg-background hover:scale-[1.01] transition-transform cursor-pointer group"
                >
                  <td className="px-6 py-5 rounded-l-[1.5rem]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full nm-inset flex items-center justify-center text-primary font-bold text-xs">
                        {item.studentName?.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.studentName}</p>
                        <p className="text-[10px] text-muted-foreground">{item.studentEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{item.type} Resume</p>
                      <p className="text-[10px] text-muted-foreground">{item.department}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-lg font-display font-medium text-primary">{item.score}%</span>
                  </td>
                  <td className="px-6 py-5 text-sm">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      statusColors[item.status]
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right rounded-r-[1.5rem]">
                    <div className="flex justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      <Link href={`/dashboard/faculty/validate/${item.id}`}>
                        <button className="nm-convex p-2 rounded-xl text-primary hover:nm-inset transition-all" title="Review">
                          <Eye size={18} />
                        </button>
                      </Link>
                      <button className="nm-convex p-2 rounded-xl text-emerald-500 hover:nm-inset transition-all" title="Quick Approve">
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
