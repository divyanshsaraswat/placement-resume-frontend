"use client";

import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { StudentDashboard } from "@/components/dashboard/role-based/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboard/role-based/FacultyDashboard";
import { SPCDashboard } from "@/components/dashboard/role-based/SPCDashboard";
import { AdminDashboard } from "@/components/dashboard/role-based/AdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "faculty":
        return <FacultyDashboard />;
      case "spc":
        return <SPCDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return (
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-display font-bold text-primary">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground text-lg">Manage your placement intelligence from your personalized dashboard.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderDashboard()}
    </div>
  );
}
