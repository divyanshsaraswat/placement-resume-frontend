import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Placement ERP | AI Resume Intelligence",
  description: "Advanced placement management system with AI-powered resume enhancement, secure LaTeX editing, and role-based workflows for MNIT.",
  keywords: ["Placement ERP", "AI Resume", "LaTeX Editor", "MNIT", "Resume Intelligence"],
};

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton theme="dark" />
            </AuthProvider>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
