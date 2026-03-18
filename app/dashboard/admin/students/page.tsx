'use client'
import { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  BarChart3, 
  Download,
  Search,
  ArrowRight,
  GraduationCap,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DonutChart, LineChart } from "@/components/dashboard/DashboardCharts";

export default function AdminStudentsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminApi.getStudentAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load student analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-muted-foreground animate-pulse">Gathering placement intelligence...</p>
      </div>
    );
  }

  const statusDistribution = [
    { label: "Approved", value: analytics?.status_distribution?.approved || 0, color: "var(--emerald-500)" },
    { label: "Submitted", value: analytics?.status_distribution?.submitted || 0, color: "var(--amber-500)" },
    { label: "Draft", value: analytics?.status_distribution?.draft || 0, color: "var(--primary)" },
    { label: "Not Started", value: analytics?.status_distribution?.not_created || 0, color: "var(--slate-400)" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap size={24} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Institutional Intelligence</span>
          </div>
          <h1 className="text-4xl font-display font-bold">Placement Analytics</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Real-time overview of student readiness, validation progress, and departmental performance across the batch.
          </p>
        </div>
        <button className="nm-flat px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold hover:nm-inset transition-all">
          <Download size={18} />
          Export Batch Report
        </button>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: "Batch Readiness", 
            value: `${analytics?.overall_readiness}%`, 
            sub: "Approved Resumes",
            icon: CheckCircle, 
            color: "text-emerald-500" 
          },
          { 
            label: "Avg batch Score", 
            value: analytics?.average_score, 
            sub: "AI Evaluation Avg",
            icon: TrendingUp, 
            color: "text-primary" 
          },
          { 
            label: "Pending Review", 
            value: analytics?.status_distribution?.submitted || 0, 
            sub: "Requires Action",
            icon: Clock, 
            color: "text-amber-500" 
          },
          { 
            label: "Total Students", 
            value: analytics?.total_students, 
            sub: "Registered Cohort",
            icon: Users, 
            color: "text-slate-400" 
          },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="nm-flat p-8 rounded-[2rem] space-y-4"
          >
            <div className={cn("nm-inset w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold">{stat.value}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Readiness Chart */}
        <DonutChart 
          data={statusDistribution}
          title="Batch Status"
          className="lg:col-span-1"
        />

        {/* Departmental Leaderboard */}
        <div className="lg:col-span-2 nm-flat rounded-[2.5rem] p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-sm uppercase tracking-widest">Departmental Readiness</h3>
              <p className="text-xs text-muted-foreground font-light">Performance breakdown by engineering branch</p>
            </div>
            <button className="text-[10px] font-bold text-primary tracking-widest uppercase hover:underline">View All</button>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[350px] pr-4 custom-scrollbar">
            {analytics?.department_metrics?.map((dept: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">{dept.name}</p>
                    <p className="text-[10px] text-muted-foreground">{dept.ready} of {dept.total} students ready</p>
                  </div>
                  <span className="text-sm font-display font-bold text-primary">{dept.readiness_rate}%</span>
                </div>
                <div className="h-2 w-full nm-inset rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.readiness_rate}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Successes / Action Required */}
      <div className="nm-flat rounded-[3rem] p-10 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <CheckCircle size={20} />
                </div>
                <h3 className="text-xl font-display font-bold">Placement Ready Pool</h3>
            </div>
            <div className="flex items-center gap-4">
               <div className="nm-inset px-4 py-2 rounded-xl flex items-center gap-2 text-xs">
                  <Search size={14} className="text-muted-foreground" />
                  <input type="text" placeholder="Filter ready students..." className="bg-transparent border-none outline-none w-40" />
               </div>
               <button className="btn-primary h-10 px-6 text-[10px]">Prepare Bulk Export</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for "Ready" students - could be a separate small list or direct link */}
            <div className="nm-convex p-6 rounded-2xl flex items-center justify-between group hover:nm-inset transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full nm-inset flex items-center justify-center font-bold text-primary">CS</div>
                    <div>
                        <p className="text-sm font-bold">Batch Export</p>
                        <p className="text-[10px] text-muted-foreground">Download all approved resumes</p>
                    </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>

            <div className="nm-convex p-6 rounded-2xl flex items-center justify-between group hover:nm-inset transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full nm-inset flex items-center justify-center font-bold text-amber-500">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Pending Review</p>
                        <p className="text-[10px] text-muted-foreground">{analytics?.status_distribution?.submitted || 0} students waiting</p>
                    </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>

            <div className="nm-convex p-6 rounded-2xl flex items-center justify-between group hover:nm-inset transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full nm-inset flex items-center justify-center font-bold text-rose-500">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Not Started</p>
                        <p className="text-[10px] text-muted-foreground">{analytics?.status_distribution?.not_created || 0} students remaining</p>
                    </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>
        </div>
      </div>
    </div>
  );
}
