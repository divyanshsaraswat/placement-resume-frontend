import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrix | AI-Powered Institutional Intelligence",
  description: "Advanced placement management system with AI-powered resume enhancement, secure LaTeX editing, and role-based workflows for MNIT.",
  keywords: ["Matrix", "Placement ERP", "AI Resume", "LaTeX Editor", "MNIT", "Resume Intelligence"],
};

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-accent selection:text-white">
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
      </body>
    </html>
  );
}
