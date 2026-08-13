import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-border/70 bg-white/70 py-20 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-xs">
            <div className="text-xl font-bold tracking-tight text-emerald mb-4 flex items-center gap-2">
              <span className="inline-block w-5 h-5 rounded-full bg-emerald" />
              DearMemory
            </div>
            <p className="text-sm text-warm-gray">
              Helping studios worldwide turn moments into lasting digital experiences since 2024.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest">Product</div>
              <div className="text-sm text-warm-gray"><Link to="/templates" className="hover:text-emerald">Templates</Link></div>
              <div className="text-sm text-warm-gray"><a href="/#features" className="hover:text-emerald">AI Search</a></div>
              <div className="text-sm text-warm-gray"><Link to="/pricing" className="hover:text-emerald">Pricing</Link></div>
              <div className="text-sm text-warm-gray"><Link to="/dashboard" className="hover:text-emerald">Dashboard</Link></div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest">Company</div>
              <div className="text-sm text-warm-gray"><a href="#">About</a></div>
              <div className="text-sm text-warm-gray"><a href="#">Journal</a></div>
              <div className="text-sm text-warm-gray"><a href="#">Privacy</a></div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest">Social</div>
              <div className="text-sm text-warm-gray"><a href="#">Instagram</a></div>
              <div className="text-sm text-warm-gray"><a href="#">Twitter</a></div>
              <div className="text-sm text-warm-gray"><a href="#">Dribbble</a></div>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4">
          <div className="text-xs text-warm-gray">© 2026 DearMemory. All rights reserved.</div>
          <div className="text-xs text-warm-gray">Made with love for the creative community.</div>
        </div>
      </div>
    </footer>
  );
}
