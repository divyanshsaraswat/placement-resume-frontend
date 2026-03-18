"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserPlus, Database, Activity, History } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, LineChart } from "../DashboardCharts";
import Link from "next/link";

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "2,450",
      icon: UserPlus,
      trend: { value: 12, isUp: true }
    },
    {
      title: "Active Resumes",
      value: "1,890",
      icon: Database,
      trend: { value: 8, isUp: true }
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: Activity,
      description: "All services operational"
    },
    {
      title: "Recent Actions",
      value: 124,
      icon: History,
      description: "Last 24 hours"
    }
  ];

  const roleDistribution = [
    { label: "Students", value: 2100, color: "var(--primary)" },
    { label: "Faculty", value: 250, color: "var(--secondary)" },
    { label: "SPC", value: 80, color: "var(--accent)" },
    { label: "Admins", value: 20, color: "#1e293b" },
  ];

  const userGrowth = [
    { label: "Week 1", current: 450, previous: 400 },
    { label: "Week 2", current: 890, previous: 750 },
    { label: "Week 3", current: 1450, previous: 1200 },
    { label: "Week 4", current: 2450, previous: 2000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-display font-bold">Admin Console</h2>
          <p className="text-muted-foreground">High-level system management and audit control.</p>
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
          maxValue={3000}
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
              {[
                { action: "ROLE_CHANGE", actor: "admin@mnit.ac.in", target: "faculty_user_01", time: "2m ago" },
                { action: "USER_DELETE", actor: "admin@mnit.ac.in", target: "spamer_99", time: "15m ago" },
                { action: "SYS_CONFIG", actor: "admin@mnit.ac.in", target: "auth_service", time: "1h ago" },
              ].map((log, i) => (
                <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-4 font-mono text-xs font-bold text-primary">{log.action}</td>
                  <td className="py-4">{log.actor}</td>
                  <td className="py-4 text-muted-foreground">{log.target}</td>
                  <td className="py-4 text-xs text-muted-foreground">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
