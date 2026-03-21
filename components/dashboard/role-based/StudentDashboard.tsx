"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Award, Clock, Target, Plus, Loader2 } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, BarChart, LineChart } from "../DashboardCharts";
import { CreateResumeDialog } from "../CreateResumeDialog";
import { resumeApi, authApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const stats = await resumeApi.getStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateResume = async (name: string, template: string, format: string, file?: File): Promise<void> => {
    try {
      const newResume = await resumeApi.createResume(name, template, format, file);
      toast.success("Resume created successfully!");
      router.push(`/dashboard/student/resumes/${newResume.id || newResume._id}/edit`);
    } catch (error) {
      toast.error("Failed to create resume");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // Map icon strings to components
  const iconMap: Record<string, any> = {
    FileText,
    Award,
    Clock,
    Target
  };

  const stats = data?.stats?.map((s: any) => ({
    ...s,
    icon: iconMap[s.icon] || FileText
  })) || [];

  const resumeTypeData = data?.resumeDistribution || [];
  const scoreHistory = data?.scoreHistory || [];
  const validationActivity = data?.validationActivity || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-display font-bold">Student Hub</h2>
          <p className="text-muted-foreground">Track your resume performance and placement readiness.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="btn-primary group h-12"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Resume
        </button>

        <CreateResumeDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onCreate={handleCreateResume}
        />
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <LineChart 
          title="AI Score Progress" 
          data={scoreHistory} 
          maxValue={100} 
          className="xl:col-span-2"
        />
        <DonutChart 
          title="Resume Distribution" 
          data={resumeTypeData} 
        />
        <BarChart 
          title="Weekly Activity" 
          data={validationActivity}
          className="xl:col-span-3"
        />
      </div>
    </div>
  );
}
