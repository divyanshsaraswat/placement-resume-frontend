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
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-20">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-display font-light tracking-tight"
          >
            Voice of the <span className="text-primary italic">Aether</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 1 }}
              className="relative nm-flat bg-background p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] h-full flex flex-col justify-between hover:nm-convex transition-all duration-500"
            >
              <p className="text-lg sm:text-xl leading-relaxed font-light text-muted-foreground italic">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4 mt-6 sm:mt-8">
                <div className="nm-inset p-1 rounded-full">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-none">
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback className="bg-primary/5 text-primary font-medium">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-primary/80">{t.name}</h4>
                  <p className="text-sm text-muted-foreground/60">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
