"use client";

import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-8">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              "0 0 40px var(--primary-glow)",
              "0 0 70px var(--primary-glow)",
              "0 0 40px var(--primary-glow)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full nm-flat flex items-center justify-center border border-primary/10"
        >
          <div className="w-12 h-12 rounded-full nm-inset flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
          <p className="font-display text-xl font-bold tracking-widest text-primary uppercase">MNIT INTELLIGENCE</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black opacity-40">Initializing Neural Core</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <motion.div 
          key={pathname} // Using key to trigger animation on route change
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 p-8 overflow-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
