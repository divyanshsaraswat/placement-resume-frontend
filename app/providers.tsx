"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader
        color="var(--primary)"
        showSpinner={false}
        shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProvider>
          <AuthProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <Toaster position="bottom-right" richColors closeButton theme="system" />
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
