import { Github, Twitter, Linkedin, Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-24 px-6 bg-background border-t border-white/5">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
        <div className="col-span-1 md:col-span-2 space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="nm-flat p-2 rounded-xl">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-display font-semibold tracking-tight">MNIT Intelligence</span>
          </div>
          <p className="text-lg text-muted-foreground/70 font-light leading-relaxed max-w-sm">
            Forging a tactile, premium future for student placements. Soft, intuitive, and high-performance.
          </p>
          <div className="flex items-center gap-6">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <Link 
                key={i} 
                href="#" 
                className="nm-convex p-3 rounded-full text-primary/60 hover:nm-inset hover:text-primary transition-all duration-300"
              >
                <Icon size={20} />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-display font-semibold text-primary/80">Ecosystem</h4>
          <ul className="space-y-3 text-muted-foreground/80 font-light">
            <li><Link href="#features" className="hover:text-primary transition-colors">Aesthetics</Link></li>
            <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Intelligence</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">Auth</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-display font-semibold text-primary/80">Support</h4>
          <ul className="space-y-3 text-muted-foreground/80 font-light">
            <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">LaTeX Guide</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-20 p-8 nm-inset rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground/50">
        <p>© 2024 MNIT Placement Portal. Tactile Excellence.</p>
        <div className="flex items-center gap-8">
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
