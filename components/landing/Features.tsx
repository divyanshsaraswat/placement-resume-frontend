"use client";

import { motion } from "framer-motion";
import { 
  CloudRain, 
  Wind, 
  Waves, 
  ShieldCheck, 
  Zap, 
  Compass 
} from "lucide-react";

const features = [
  {
    icon: Wind,
    title: "Vapor Refinement",
    description: "Our AI gently flows through your experiences, refining bullet points with the precision of a master typesetter."
  },
  {
    icon: CloudRain,
    title: "Atmospheric Scoring",
    description: "Instantly sense how recruitment algorithms perceive your narrative with deep-reasoning analytics."
  },
  {
    icon: Waves,
    title: "Fluid LaTeX Authoring",
    description: "A serene workspace for professional document creation. Live preview that feels like a natural extension of your thought."
  },
  {
    icon: ShieldCheck,
    title: "Ethereal Security",
    description: "Your professional data is locked within the MNIT academic sphere, protected by institutional-grade SSO."
  },
  {
    icon: Zap,
    title: "Instant Inception",
    description: "Powered by Groq's high-velocity inference, your ideas materialise into professional LaTeX code in real-time."
  },
  {
    icon: Compass,
    title: "Guided Navigation",
    description: "A unified, airy dashboard for students and faculty to coordinate the placement journey effortlessly."
  }
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 relative bg-white/10">
      <div className="max-w-6xl mx-auto space-y-24">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-primary font-display font-medium uppercase tracking-[0.2em] text-xs"
          >
            Aura of Excellence
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-display font-light tracking-tight"
          >
            Capabilities that <span className="italic text-primary/80">Drift</span> Higher
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group"
            >
              <div className="nm-flat bg-background p-6 sm:p-10 h-full rounded-[2.5rem] sm:rounded-[3rem] hover:nm-convex transition-all duration-300">
                <div className="nm-inset w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-background flex items-center justify-center text-primary mb-6 sm:mb-8 group-hover:scale-110 transition-all duration-500">
                  <feature.icon size={22} className="sm:size-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-medium mb-3 sm:mb-4 tracking-tight text-primary/90">{feature.title}</h3>
                <p className="text-muted-foreground/80 leading-relaxed font-light text-base sm:text-lg">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
