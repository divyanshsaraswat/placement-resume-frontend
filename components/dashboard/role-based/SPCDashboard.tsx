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
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BarChart 
            title="Readiness by Department (%)" 
            data={deptReadiness}
            className="h-full"
          />
        </div>
        <DonutChart 
          title="Global Resume Status" 
          data={resumeStatus} 
          className="h-full"
        />
      </div>

    </div>
  );
}
