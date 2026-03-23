import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYSUME | AI-Powered Institutional Intelligence",
  description: "Advanced placement management system with AI-powered resume enhancement, secure LaTeX editing, and role-based workflows for MNIT by Scasys Technologies.",
  keywords: ["SYSUME", "Scasys Technologies", "Placement Management", "AI Resume", "LaTeX Editor", "MNIT", "Resume Intelligence"],
  authors: [{ name: "Scasys Technologies" }],
  creator: "Scasys Technologies",
  publisher: "Scasys Technologies",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sysume.com", // Adjust if there's a different production URL
    siteName: "SYSUME",
    title: "SYSUME | AI-Powered Institutional Intelligence",
    description: "Advanced placement management system with AI-powered resume enhancement and role-based workflows.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SYSUME - AI-Powered Institutional Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYSUME | AI-Powered Institutional Intelligence",
    description: "Advanced placement management system with AI-powered resume enhancement and role-based workflows.",
    images: ["/og-image.png"],
    creator: "@sysume", // Adjust if there's a specific twitter handle
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico", // Using favicon.ico as a placeholder if no dedicated png exists
  },
  robots: {
    index: true,
    follow: true,
  },
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
