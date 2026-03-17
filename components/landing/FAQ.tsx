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
    <section id="faq" className="py-32 px-6 bg-primary/[0.02]">
      <div className="max-w-3xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-light tracking-tight text-primary/90"
          >
            Guided <span className="italic">Clarity</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion className="w-full space-y-6">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="nm-flat bg-background px-5 sm:px-8 rounded-2xl sm:rounded-3xl border-none transition-all hover:nm-convex">
                <AccordionTrigger className="text-left font-display font-medium text-base sm:text-lg text-primary/70 hover:text-primary transition-colors hover:no-underline py-4 sm:py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground/80 text-sm sm:text-base leading-relaxed font-light pb-4 sm:pb-6">
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
