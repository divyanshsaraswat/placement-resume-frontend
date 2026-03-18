"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Users, Clock, ClipboardList, CheckCircle2, Loader2 } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, BarChart } from "../DashboardCharts";
import Link from "next/link";
import { resumeApi, adminApi } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function FacultyDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analytics, validationQueue] = await Promise.all([
          adminApi.getStudentAnalytics(),
          resumeApi.getValidationQueue({ limit: 3 })
        ]);
        setData(analytics);
        setQueue(validationQueue);
      } catch (error) {
        console.error("Failed to fetch faculty dashboard:", error);
        toast.error("Failed to load dashboard data");
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
      title: "Pending Reviews",
      value: data?.status_distribution?.submitted || 0,
      icon: Clock,
      description: "Resumes awaiting review",
      trend: { value: 8, isUp: false }
    },
    {
      title: "Total Validated",
      value: (data?.status_distribution?.approved || 0) + (data?.status_distribution?.rejected || 0),
      icon: UserCheck,
      trend: { value: 15, isUp: true }
    },
    {
      title: "Assigned Students",
      value: data?.total_students || 0,
      icon: Users,
      description: "Aggregate view"
    },
    {
      title: "Avg Review Time",
      value: "4.2h", // Still mocked for now
      icon: ClipboardList,
      trend: { value: 10, isUp: true }
    }
  ];

  const validationStatusData = Object.entries(data?.status_distribution || {})
    .filter(([k]) => ["approved", "rejected", "submitted"].includes(k))
    .map(([label, value], i) => {
      const colors = ["var(--primary)", "var(--destructive)", "var(--accent)"];
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: value as number,
        color: colors[i % colors.length]
      };
    });

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
          {queue.map((student, i) => (
            <div key={student.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-border/50 group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                  {student.studentName?.[0] || "S"}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 dark:text-white">{student.studentName}</span>
                  <span className="text-xs text-muted-foreground">
                    {student.type} Resume • Submitted {student.updatedAt ? formatDistanceToNow(new Date(student.updatedAt), { addSuffix: true }) : "recently"}
                  </span>
                </div>
              </div>
              <Link href={`/dashboard/faculty/validate?id=${student.id}`}>
                <button className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Review →
                </button>
              </Link>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="py-8 text-center text-muted-foreground italic text-sm">
              Validation queue is currently empty
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
