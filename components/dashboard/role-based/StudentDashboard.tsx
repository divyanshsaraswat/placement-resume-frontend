"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Award, Clock, Target, Plus } from "lucide-react";
import { DashboardStats } from "../DashboardStats";
import { DonutChart, BarChart, LineChart } from "../DashboardCharts";
import { CreateResumeDialog } from "../CreateResumeDialog";

export function StudentDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stats = [
    {
      title: "Active Resumes",
      value: 3,
      icon: FileText,
      description: "2 SDE, 1 Marketing",
      trend: { value: 12, isUp: true }
    },
    {
      title: "Avg AI Score",
      value: "84/100",
      icon: Award,
      trend: { value: 5, isUp: true }
    },
    {
      title: "Pending Reviews",
      value: 1,
      icon: Clock,
      description: "Awaiting Faculty response"
    },
    {
      title: "Placement Goal",
      value: "92%",
      icon: Target,
      description: "SDE Role Readiness",
      trend: { value: 2, isUp: true }
    }
  ];

  const resumeTypeData = [
    { label: "SDE", value: 2, color: "var(--primary)" },
    { label: "Marketing", value: 1, color: "var(--accent)" },
    { label: "Core", value: 0, color: "var(--secondary)" },
  ];

  const scoreHistory = [
    { label: "Jan", current: 65, previous: 60 },
    { label: "Feb", current: 72, previous: 65 },
    { label: "Mar", current: 84, previous: 70 },
  ];

  const validationActivity = [
    { label: "Mon", value: 2, maxValue: 5 },
    { label: "Tue", value: 4, maxValue: 5 },
    { label: "Wed", value: 1, maxValue: 5 },
    { label: "Thu", value: 3, maxValue: 5 },
    { label: "Fri", value: 5, maxValue: 5 },
    { label: "Sat", value: 0, maxValue: 5 },
    { label: "Sun", value: 0, maxValue: 5 },
  ];

  const handleCreateResume = async (name: string, template: string): Promise<void> => {
    // Mock create logic
    console.log("Creating resume:", name, "with template:", template);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

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
