import { Link, useNavigate } from "@tanstack/react-router";
import { getToken, clearToken } from "@/lib/api/client";
import { useState, useEffect } from "react";

export function SiteNav() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      clearToken();
      setIsLoggedIn(false);
      navigate({ to: "/" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-6 pt-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-border/70 bg-white/75 px-4 py-3 shadow-[0_10px_30px_rgba(45,42,41,0.06)] backdrop-blur-xl">
        <Link to="/" className="text-xl font-bold tracking-tight text-emerald flex items-center gap-2">
          <span className="inline-block w-6 h-6 rounded-full bg-emerald" />
          DearMemory
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium text-warm-gray">
          <Link to="/templates" className="hover:text-emerald transition-colors">Templates</Link>
          <Link to="/studio/$slug" params={{ slug: "goldenhour" }} className="hover:text-emerald transition-colors">Showcase</Link>
          <a href="/#features" className="hover:text-emerald transition-colors">Features</a>
          <Link to="/pricing" className="hover:text-emerald transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="hidden sm:inline text-sm font-medium text-warm-gray hover:text-emerald transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep transition-colors shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm font-medium text-warm-gray hover:text-emerald transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-deep transition-colors shadow-sm"
              >
                Start Creating
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}