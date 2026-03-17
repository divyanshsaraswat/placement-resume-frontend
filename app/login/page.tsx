"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Sparkles, GraduationCap, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        await loginWithGoogle(credentialResponse.credential);
        toast.success("Welcome to MNIT Intelligence!");
        router.push("/dashboard");
      } catch (err) {
        console.error("Login failed:", err);
        toast.error("Access Denied", {
          description: "Please use your official @mnit.ac.in account."
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-12 text-center"
      >
        <div className="inline-flex items-center gap-4 text-primary">
          <div className="nm-flat p-4 rounded-2xl">
            <Sparkles size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight">MNIT Intelligence</h1>
        </div>

        <div className="nm-flat p-10 rounded-[3rem] space-y-8 bg-background">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Placement Portal</h2>
            <p className="text-muted-foreground font-light">Sign in with your University Google Account</p>
          </div>

          <div className="flex justify-center py-4">
             <div className="nm-convex p-1 rounded-xl w-full max-w-xs flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log('Login Failed')}
                  theme="filled_blue"
                  shape="pill"
                  width="250"
                  useOneTap
                />
             </div>
          </div>
          
          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground/30 uppercase tracking-[0.2em] font-bold">
              Restricted to @mnit.ac.in
            </p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/20 italic">
          High-performance Placement ERP v1.0
        </p>
      </motion.div>
    </div>
  );
}
