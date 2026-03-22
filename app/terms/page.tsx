"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Scale, Terminal, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function TermsOfServicePage() {
  const provisions = [
    {
      title: "Platform Engagement",
      icon: Terminal,
      content: "Users are granted a limited, non-exclusive license to use SYSUME for academic and recruitment purposes. Unauthorized reverse engineering or automated data harvesting is strictly prohibited."
    },
    {
      title: "Intellectual Property",
      icon: Scale,
      content: "Students retain 100% ownership of the content within their resumes. Scasys Technologies retains ownership of the platform's proprietary algorithms, AI logic, and 'Triansh' branding."
    },
    {
      title: "Institutional Accuracy",
      icon: CheckCircle2,
      content: "While Triansh AI provides high-precision scoring, users are responsible for the factual accuracy of their documents. Final resume approval rests with the Institutional Placement Cell."
    },
    {
      title: "Code of Conduct",
      icon: AlertTriangle,
      content: "Users must adhere to MNIT academic integrity standards. Any attempt to spoof institutional credentials or upload malicious LaTeX code will result in immediate account revocation."
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <Header />
      
      <div className="pt-44 pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-20">
          {/* Page Header */}
          <div className="space-y-6 text-center lg:text-left">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return Home
            </Link>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              Terms of <span className="text-primary/70">Engagement.</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-400 font-light leading-relaxed">
              Establishing the framework for professional recruitment and technical authoring on the SYSUME platform.
            </p>
          </div>

          {/* Interactive Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {provisions.map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-medium mb-4 text-slate-800 dark:text-slate-100">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Legalities */}
          <div className="prose prose-slate dark:prose-invert max-w-none pt-12 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-12">
              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">01. Service Provision</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  SYSUME is provided as is. While we strive for 99.9% uptime, Scasys Technologies is not liable for temporary service interruptions during peak recruitment cycles or scheduled infrastructure maintenance.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">02. Data Usage & AI</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  By using the AI Review features, you acknowledge that automated suggestions are based on large-scale placement datasets and should be reviewed for personal relevance and accuracy before final submission to the placement cell.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">03. Termination</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  The institution reserves the right to terminate access for any user found to be in violation of the campus recruitment policy or found misusing the AI credits provided through the institutional node.
                </p>
              </section>

              <div className="flex justify-center pt-8">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
                  Last Updated: March 2026 • Scasys Technologies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
