"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does the AI maintain LaTeX integrity?",
    answer: "Our engine uses sophisticated structural analysis to isolate content from commands, ensuring every AI-suggested improvement flows naturally into your LaTeX source without breaking the document aura."
  },
  {
    question: "Is my institutional data truly private?",
    answer: "Absolutely. We leverage MNIT's official Google SSO to ensure that your professional narrative remains within the verified boundaries of our academic community."
  },
  {
    question: "Can I collaborate on resume drafts?",
    answer: "The platform is designed for a flowing exchange between students and faculty. Drafts can be reviewed and refined in real-time within the secure cloud environment."
  },
  {
    question: "What makes the editor feel 'ethereal'?",
    answer: "Beyond aesthetics, it's about the lack of friction. High-velocity AI reasoning and instant LaTeX preview create a workspace that feels light and responsive to your every thought."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="py-48 px-6">
      <div className="max-w-4xl mx-auto space-y-24">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-800 dark:text-slate-100"
          >
            System <span className="text-primary/70">Clarity.</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-slate-50 dark:border-slate-900 px-0 transition-opacity hover:opacity-80">
                <AccordionTrigger className="text-left py-8 text-base font-medium text-slate-700 dark:text-slate-200">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 text-base font-light leading-relaxed pb-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
