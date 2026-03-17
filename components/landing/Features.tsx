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
    title: "Precision Optimization",
    description: "AI-driven refinement and syntax checking for high-impact professional narratives."
  },
  {
    icon: CloudRain,
    title: "Institutional Analytics",
    description: "Real-time insights tailored to academic recruitment and core industry standards."
  },
  {
    icon: Waves,
    title: "LaTeX Authoring",
    description: "Institutional-grade document creation with live preview and synchronization."
  },
  {
    icon: ShieldCheck,
    title: "Secure Governance",
    description: "Enterprise-level data protection within the secure MNIT network boundary."
  },
  {
    icon: Zap,
    title: "High-Performance Compute",
    description: "Instant document compilation powered by ultra-low latency infrastructure."
  },
  {
    icon: Compass,
    title: "Career Coordination",
    description: "A unified platform for students and faculty to coordinate recruitment lifecycles."
  }
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Technical <br />
              <span className="text-primary/70">Foundations.</span>
            </h2>
            <p className="max-w-lg text-lg text-slate-400 font-light">
              An ecosystem that prioritizes precision, speed, and institutional security.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-24">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="text-primary/40 group-hover:text-primary transition-colors">
                <feature.icon size={28} strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium tracking-tight text-slate-700 dark:text-slate-200">{feature.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
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
