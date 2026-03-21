"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  index: number;
}

export function StatCard({ title, value, icon: Icon, description, trend, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="premium-card relative overflow-hidden group shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 border-slate-100 dark:border-transparent hover:border-primary/10"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
        <Icon size={100} strokeWidth={1} />
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500 text-slate-500 dark:text-slate-400">
            <Icon size={22} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{title}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-4xl font-display font-bold text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform duration-500">{value}</span>
          {trend && (
            <div className={cn(
              "flex items-center gap-2 mt-1 text-xs font-bold",
              trend.isUp ? "text-emerald-600" : "text-rose-600"
            )}>
              <div className={cn(
                "px-1.5 py-0.5 rounded-md flex items-center",
                trend.isUp ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"
              )}>
                {trend.isUp ? "↑" : "↓"} {trend.value}%
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">vs last week</span>
            </div>
          )}
          {description && !trend && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardStats({ stats }: { stats: Omit<StatCardProps, "index">[] }) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 gap-6",
      stats.length === 1 ? "lg:grid-cols-1" : 
      stats.length === 2 ? "lg:grid-cols-2" : 
      stats.length === 3 ? "lg:grid-cols-3" : 
      "lg:grid-cols-4"
    )}>
      {stats.map((stat, i) => (
        <StatCard key={stat.title} {...stat} index={i} />
      ))}
    </div>
  );
}
