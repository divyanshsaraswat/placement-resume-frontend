import { Github, Twitter, Linkedin, Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-24 px-6 mt-32">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 border-t border-slate-50 dark:border-slate-900 pt-24">
        <div className="col-span-1 md:col-span-2 space-y-10">
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
            <div className="text-primary">
              <Sparkles size={24} strokeWidth={1} />
            </div>
            <span className="text-xl font-semibold tracking-tight">Matrix</span>
          </div>
          <p className="text-base text-slate-400 font-light leading-relaxed max-w-sm">
            Institutional document intelligence engine for student recruitment and technical authoring.
          </p>
          <div className="flex items-center gap-6">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <Link 
                key={i} 
                href="#" 
                className="text-slate-300 hover:text-primary transition-colors"
              >
                <Icon size={18} strokeWidth={1} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-800 dark:text-slate-100">Platform</h4>
          <ul className="space-y-3 text-sm text-slate-400 font-light">
            <li><Link href="#why" className="hover:text-primary transition-colors">Why</Link></li>
            <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Institutional Login</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-800 dark:text-slate-100">Institutional</h4>
          <ul className="space-y-3 text-sm text-slate-400 font-light">
            <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">LaTeX Support</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-24 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-slate-300 font-light">
        <p>© 2026 MNIT Matrix. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <Link href="#" className="hover:text-primary transition-colors">Institutional Terms</Link>
        </div>
      </div>
    </footer>
  );
}
