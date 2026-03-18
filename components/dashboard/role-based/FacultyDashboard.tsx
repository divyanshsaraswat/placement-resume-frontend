"use client";

import { motion } from "framer-motion";
import { UserCheck, Users, Clock, ClipboardList, CheckCircle2 } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, BarChart } from "../DashboardCharts";
import Link from "next/link";

export function FacultyDashboard() {
  const stats = [
    {
      title: "Pending Reviews",
      value: 12,
      icon: Clock,
      description: "Resumes awaiting review",
      trend: { value: 8, isUp: false }
    },
    {
      title: "Total Validated",
      value: 145,
      icon: UserCheck,
      trend: { value: 15, isUp: true }
    },
    {
      title: "Assigned Students",
      value: 48,
      icon: Users,
      description: "Batch of 2026"
    },
    {
      title: "Avg Review Time",
      value: "4.2h",
      icon: ClipboardList,
      trend: { value: 10, isUp: true }
    }
  ];

  const validationStatusData = [
    { label: "Approved", value: 85, color: "var(--primary)" },
    { label: "Rejected", value: 30, color: "var(--destructive)" },
    { label: "Pending", value: 12, color: "var(--accent)" },
  ];

  const reviewActivity = [
    { label: "Mon", value: 8, maxValue: 15 },
    { label: "Tue", value: 12, maxValue: 15 },
    { label: "Wed", value: 15, maxValue: 15 },
    { label: "Thu", value: 6, maxValue: 15 },
    { label: "Fri", value: 10, maxValue: 15 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-display font-bold">Faculty Portal</h2>
          <p className="text-muted-foreground">Manage resume validations and student progress.</p>
        </div>
        <Link href="/dashboard/faculty/validate">
          <button className="btn-primary group h-12">
            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            Open Queue
          </button>
        </Link>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart 
          title="Daily Validations" 
          data={reviewActivity}
        />
        <DonutChart 
          title="Overall Status" 
          data={validationStatusData} 
        />
      </div>

      <div className="premium-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Priority Queue</h3>
          <span className="text-xs text-muted-foreground">Last updated: Just now</span>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-border/50 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  S{i}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Student Name {i}</span>
                  <span className="text-xs text-muted-foreground">SDE Resume • Submitted 2h ago</span>
                </div>
              </div>
              <button className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Review →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
