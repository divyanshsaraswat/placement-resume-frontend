"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, Database, Activity, History, Loader2, AlertTriangle } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, LineChart } from "../DashboardCharts";
import Link from "next/link";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stats, recentLogs] = await Promise.all([
          adminApi.getStats(),
          adminApi.getLogs({ limit: 5 })
        ]);
        setData(stats);
        setLogs(recentLogs);
      } catch (error) {
        console.error("Failed to fetch admin dashboard:", error);
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

  // Map icon strings to components
  const iconMap: Record<string, any> = {
    UserPlus,
    Database,
    Activity,
    History,
    AlertTriangle
  };

  const stats = data?.stats?.map((s: any) => ({
    ...s,
    icon: iconMap[s.icon] || UserPlus
  })) || [];

  const roleDistribution = data?.roleDistribution || [];
  const userGrowth = data?.userGrowth || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-display font-bold tracking-tight">Admin Console</h2>
          <p className="text-sm text-muted-foreground font-light">High-level system management and audit control.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/users">
            <button className="btn-secondary h-12">Manage Users</button>
          </Link>
          <Link href="/dashboard/admin/logs">
            <button className="btn-primary h-12">View Security Logs</button>
          </Link>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          title="User Acquisition" 
          data={userGrowth} 
          maxValue={Math.max(...userGrowth.map((d: any) => d.current), 100) * 1.2}
        />
        <DonutChart 
          title="User Roles" 
          data={roleDistribution} 
        />
      </div>

      <div className="premium-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Latest Audit Logs</h3>
          <Link href="/dashboard/admin/logs" className="text-xs text-primary font-bold">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="pb-4 font-bold">Action</th>
                <th className="pb-4 font-bold">Actor</th>
                <th className="pb-4 font-bold">Target</th>
                <th className="pb-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.map((log, i) => (
                <tr key={log.id || i} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 font-mono text-xs font-bold text-primary">{log.action}</td>
                  <td className="py-4">{log.actor_name}</td>
                  <td className="py-4 text-muted-foreground">{log.target || "-"}</td>
                  <td className="py-4 text-xs text-muted-foreground">
                    {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : "just now"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground italic">No logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
