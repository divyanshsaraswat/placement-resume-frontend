"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Aryan Sharma",
    role: "SDE @ Google",
    content: "The intelligence here is almost transparent. It doesn't just rewrite; it elevates the technical soul of your resume.",
    avatar: "/avatars/1.png"
  },
  {
    name: "Dr. R.K. Vyas",
    role: "Placement Faculty",
    content: "A serene approach to institution management. The validation workflow is light, fast, and remarkably intuitive.",
    avatar: "/avatars/2.png"
  },
  {
    name: "Riya Kapoor",
    role: "SPC, CSE",
    content: "Finally, a platform that feels like the future. Airy design coupled with heavyweight AI reasoning.",
    avatar: "/avatars/3.png"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-6 bg-slate-50/30 dark:bg-slate-900/10">
      <div className="max-w-6xl mx-auto space-y-16 md:space-y-20">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-800 dark:text-slate-100"
          >
            Institutional <span className="text-primary/70">Voices.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="flex flex-col space-y-8"
            >
              <p className="text-lg leading-relaxed font-light text-slate-400 italic">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-50 dark:border-slate-900">
                <Avatar className="h-10 w-10 border-none shrink-0 filter grayscale opacity-60">
                  <AvatarImage src={t.avatar} />
                  <AvatarFallback className="bg-slate-100 text-slate-400 font-medium">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-light uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
