"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Briefcase, TrendingUp, Search, Loader2 } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, BarChart, LineChart } from "../DashboardCharts";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

export function SPCDashboard() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const analytics = await adminApi.getStudentAnalytics();
        setData(analytics);
      } catch (error) {
        console.error("Failed to fetch SPC analytics:", error);
        toast.error("Failed to load placement analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const stats = [
    {
      title: "Placement Ready",
      value: `${data?.overall_readiness || 0}%`,
      icon: GraduationCap,
      description: "Approved resumes",
      trend: { value: 5, isUp: true }
    },
    {
      title: "Total Students",
      value: data?.total_students || 0,
      icon: Users,
    },
    {
      title: "Active Drives",
      value: 12, // Draft for now
      icon: Briefcase,
      description: "Upcoming companies"
    },
    {
      title: "Validation Rate",
      value: "94%", // Draft for now
      icon: TrendingUp,
      trend: { value: 2, isUp: true }
    }
  ];

  const deptReadiness = data?.department_metrics?.map((d: any) => ({
    label: d.name,
    value: d.readiness_rate,
    maxValue: 100
  })) || [];

  const resumeStatus = Object.entries(data?.status_distribution || {}).map(([label, value], i) => {
    const colors = ["var(--primary)", "var(--secondary)", "var(--accent)", "#1e293b", "#64748b"];
    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: value as number,
      color: colors[i % colors.length]
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">SPC Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-light">Aggregate placement intelligence and readiness tracking.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="h-12 pl-12 pr-6 bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-primary transition-all w-64 focus:w-80 rounded-none outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          title="Readiness by Department (%)" 
          data={deptReadiness}
        />
        <DonutChart 
          title="Global Resume Status" 
          data={resumeStatus} 
        />
      </div>

      <div className="premium-card">
        <h3 className="text-lg font-semibold mb-6 text-slate-800 dark:text-white">Upcoming Placement Drives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {["Google", "Microsoft", "Amazon"]
            .filter(company => company.toLowerCase().includes(search.toLowerCase()))
            .map((company) => (
              <motion.div 
                key={company}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-border hover:border-primary/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all">
                    {company[0]}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Active</span>
                </div>
                <h4 className="font-bold text-lg text-slate-800 dark:text-white">{company}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-light">Software Dev Engineer Intern</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">85 Applicants</span>
                  <span className="text-xs text-primary font-bold">Details →</span>
                </div>
              </motion.div>
            ))}
          {["Google", "Microsoft", "Amazon"].filter(company => company.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground/50 italic text-sm">
              No matching placement drives found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
