"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Sparkles, MessageCircle, Zap } from "lucide-react";

const faqs = [
  {
    question: "How does the Matrix matching work?",
    answer: "Our AI analysis engine compares your resume against target job descriptions using 50+ vector parameters, giving you a real-time 'Matching Index' used by MNIT placement cell.",
    icon: Zap
  },
  {
    question: "Is my data secure within MNIT domain?",
    answer: "Completely. We use MNIT's intranet security protocols and role-based access control. Your resumes are encrypted and stored locally within the college infrastructure.",
    icon: HelpCircle
  },
  {
    question: "Can I edit the LaTeX source directly?",
    answer: "Yes! While our AI drafts the resume, you have full control over the .tex source code through our embedded secure editor with real-time preview.",
    icon: MessageCircle
  },
  {
    question: "What makes this better than standard ERPs?",
    answer: "Standard ERPs are just databases. MNIT Intel is an intelligence layer. It proactively tells you which skills you're missing for your dream company.",
    icon: Sparkles
  }
];

export function FeatureQuestions() {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24 items-start">
          <div className="lg:w-1/3 space-y-8 lg:sticky lg:top-32">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
              System <br />
              <span className="text-primary/70">Intelligence.</span>
            </h2>
            <p className="text-lg text-slate-400 font-light leading-relaxed">
              Everything you need to know about the technical recruitment workflow.
            </p>
          </div>

          <div className="lg:w-2/3 w-full">
            <Accordion type="single" collapsible className="space-y-2 w-full">
              {faqs.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`item-${i}`}
                  className="border-b border-slate-50 dark:border-slate-900 px-0 transition-opacity hover:opacity-80"
                >
                  <AccordionTrigger className="py-10 pt-0 group">
                    <div className="flex items-center gap-6 text-left">
                      <div className="text-primary/30 group-hover:text-primary transition-colors">
                        <faq.icon size={22} strokeWidth={1} />
                      </div>
                      <span className="text-lg font-medium tracking-tight text-slate-700 dark:text-slate-200">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-10 text-base font-light text-slate-400 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
