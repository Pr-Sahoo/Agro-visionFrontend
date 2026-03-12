// src/components/layout/Navbar.jsx

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, Sun, Moon, Menu, X, LayoutDashboard, Sprout, CloudSun, Brain, LogOut, User } from "lucide-react";
import { useAuth }  from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const LINKS = [
  { to: "/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { to: "/crops",      icon: Sprout,           label: "Crops"     },
  { to: "/weather",    icon: CloudSun,          label: "Weather"   },
  { to: "/ai-advisor", icon: Brain,             label: "AI Advisor"},
];

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { dark, toggle }  = useTheme();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenu,   setUserMenu]     = useState(false);

  const active = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 inset-x-0 z-40">
      <div className="glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-leaf-500 flex items-center justify-center shadow-[0_4px_18px_rgba(42,154,42,0.35)] group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text)]">
              Agro<span className="text-leaf-500">Vision</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${active(to)
                    ? "bg-leaf-500/10 text-leaf-600 dark:text-leaf-400"
                    : "text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)]"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggle} aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-all relative">
              <Sun  className={`w-5 h-5 absolute transition-all duration-300 ${dark  ? "opacity-0 scale-50" : "opacity-100 scale-100"}`} />
              <Moon className={`w-5 h-5 absolute transition-all duration-300 ${!dark ? "opacity-0 scale-50" : "opacity-100 scale-100"}`} />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button onClick={() => setUserMenu(o => !o)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[var(--bg2)] transition-all">
                <div className="w-7 h-7 rounded-lg bg-leaf-500 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[var(--text)] max-w-[90px] truncate">
                  {user?.name}
                </span>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 card p-2 shadow-2xl animate-slide-down">
                  <div className="px-3 py-2 mb-2 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">{user?.name}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--bg2)] text-[var(--text2)] transition-all">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {LINKS.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all
                  ${active(to)
                    ? "bg-leaf-500/10 text-leaf-600 dark:text-leaf-400"
                    : "text-[var(--text2)] hover:bg-[var(--bg2)]"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}