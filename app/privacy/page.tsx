"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information Collection",
      icon: Eye,
      content: "We collect information essential for the resume enhancement process, including contact details, academic history, and professional experience voluntarily provided by users. This includes LaTeX source code and uploaded document formats (PDF/DOCX)."
    },
    {
      title: "Data Utilization",
      icon: FileText,
      content: "Collected data is processed through Triansh AI to provide scoring, feedback, and optimization. Aggregated, non-identifiable data may be used for institutional analytics and placement readiness reporting for MNIT Jaipur."
    },
    {
      title: "Security Protocols",
      icon: Lock,
      content: "SYSUME employs institutional-grade encryption and secure data residency protocols. All resumes and personal data are stored in encrypted vaults protected by multi-factor authentication and role-based access controls."
    },
    {
      title: "User Control",
      icon: Shield,
      content: "Users maintain full ownership of their document portfolios. You may edit, update, or request the permanent deletion of your iterative records at any time through the platform settings or by contacting Scasys Support."
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
              Privacy <span className="text-primary/70">Protocols.</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-400 font-light leading-relaxed">
              How we protect your institutional data and professional identity within the SYSUME ecosystem.
            </p>
          </div>

          {/* Interactive Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {sections.map((section, i) => (
              <motion.div 
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <section.icon size={24} />
                </div>
                <h3 className="text-xl font-medium mb-4 text-slate-800 dark:text-slate-100">{section.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed text-sm">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none pt-12 border-t border-slate-100 dark:border-slate-800/50">
            <div className="space-y-12">
              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">01. Data Governance</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  SYSUME is engineered with a focus on institutional data sovereignty. All processing is conducted within secure infrastructure environments, ensuring that student and faculty data never leaves the authorized administrative boundary of MNIT Jaipur without explicit user consent.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">02. Third-Party Integration</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  While we utilize advanced AI nodes for document intelligence, all data transmitted to LLM providers is stripped of personally identifiable information where possible and is processed under strict enterprise data protection agreements that forbid the use of participant data for training underlying models.
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary">03. Compliance</h4>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                  Scasys Technologies ensures that the platform adheres to international data protection standards (GDPR-aligned) and local institutional policies regarding student record management and academic confidentiality.
                </p>
              </section>

              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Questions regarding your data?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reach out to our Data Protection Officer.</p>
                </div>
                <Link 
                  href="mailto:support@mnit.ac.in"
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
