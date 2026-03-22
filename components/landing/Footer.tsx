"use client";
import { Github, Twitter, Linkedin, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A0C10] text-slate-300 py-20 px-6 sm:px-12 md:px-20 mt-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 pb-20">
          
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-3 text-white">
              <div className="text-primary">
                <Sparkles size={28} strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-bold tracking-tighter">Matrix</span>
            </div>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-sm">
              Institutional document intelligence engine for student recruitment and technical authoring. 
              Engineering the next generation of academic ecosystems.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-start-7 md:col-span-2 space-y-6">
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white">Explore</h4>
            <ul className="space-y-4 text-[14px] font-medium text-slate-500">
              <li><Link href="#why" className="hover:text-white transition-colors">Why</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/demo" className="hover:text-white transition-colors">View Demo</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
            </ul>
          </div>

          {/* Institutional Column */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white">Platform</h4>
            <ul className="space-y-4 text-[14px] font-medium text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">LaTeX Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          {/* Social / Contact Column */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[13px] font-bold uppercase tracking-widest text-white">Contact</h4>
            <ul className="space-y-4 text-[14px] font-medium text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors">X (Twitter)</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
              <li><Link href="mailto:support@mnit.ac.in" className="hover:text-white transition-colors">Email Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 order-2 sm:order-1">
            <p className="text-[12px] font-medium text-slate-600">
              © MNIT Matrix 2026. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-8 order-1 sm:order-2">
            <Link href="#" className="text-[12px] font-medium text-slate-600 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[12px] font-medium text-slate-600 hover:text-white transition-colors">Terms of Service</Link>
            
            <button 
              onClick={scrollToTop}
              className="p-2 border border-slate-900 rounded-lg hover:border-slate-700 hover:text-white transition-all ml-4 group"
              aria-label="Back to top"
            >
              <ArrowRight size={14} className="-rotate-90 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
