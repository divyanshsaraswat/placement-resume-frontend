"use client";

import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-[#020617]">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          <p className="text-[10px] text-slate-400 font-light uppercase tracking-[0.2em]">Matrix</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isEditorPage = pathname.includes("/edit");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col relative h-full">
        {!isEditorPage && <DashboardHeader />}
        <div 
          data-lenis-prevent
          className={cn(
            "flex-1 min-h-0 w-full",
            !isEditorPage ? "overflow-y-auto overflow-x-hidden p-8" : "h-full"
          )}
        >
          <motion.div 
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={cn("w-full", isEditorPage && "h-full")}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
