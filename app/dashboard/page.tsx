"use client";

import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-display font-bold text-primary">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground text-lg">Manage your placement intelligence from your personalized {user?.role} dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
          <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
            {/* Simple icon placeholder */}
            <span className="text-2xl font-bold">1</span>
          </div>
          <h3 className="text-xl font-semibold">Active Resumes</h3>
          <p className="text-muted-foreground font-light">Prepare and manage your LaTeX resumes with AI feedback.</p>
        </div>
        
        <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
          <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
            <span className="text-2xl font-bold">2</span>
          </div>
          <h3 className="text-xl font-semibold">Validation Status</h3>
          <p className="text-muted-foreground font-light">Track real-time approval status from Faculty and SPCs.</p>
        </div>

        <div className="nm-flat p-8 rounded-[2.5rem] space-y-4">
          <div className="nm-inset w-12 h-12 rounded-xl flex items-center justify-center text-primary">
            <span className="text-2xl font-bold">3</span>
          </div>
          <h3 className="text-xl font-semibold">AI Insights</h3>
          <p className="text-muted-foreground font-light">View deep analysis of your resumes and improve visibility.</p>
        </div>
      </div>
    </div>
  );
}
