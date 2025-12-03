import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Send, LogOut, LayoutDashboard, Sparkles, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { ShinyBadge } from "./ui/ShinyBadge";
import { ShimmerButton } from "./ui/ShimmerButton";
import { RainbowButton } from "./ui/RainbowButton";
import Magnetic from "./ui/Magnetic";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  const navWidth = useTransform(scrollY, [0, 100], ["100%", "80%"]);
  const navTop = useTransform(scrollY, [0, 100], [0, 20]);
  const navBorderRadius = useTransform(scrollY, [0, 100], [0, 24]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user && user.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const NavLink = ({ to, children, className, active }) => {
    const isActive = active !== undefined ? active : location.pathname === to;

    return (
      <Magnetic>
        <Link to={to} className={`relative px-4 py-2 group ${className}`}>
          {isActive && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-400/20 dark:via-purple-400/20 dark:to-pink-400/20 rounded-full -z-10 blur-sm"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className={`relative text-[15px] font-medium transition-all duration-300 ${isActive
            ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient bg-[length:200%_auto]"
            : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
            }`}>
            {children}
          </span>
        </Link>
      </Magnetic>
    );
  };

  // --- Dynamic Auth Section ---
  const AuthButtons = () => {
    if (!isAuthenticated) {
      return (
        <div className="hidden items-center gap-4 sm:flex">
          <Link to="/login" className="text-[15px] font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Log in
          </Link>
          <Magnetic>
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-1 rounded-full bg-zinc-900 px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-zinc-500/20 transition-all hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-black dark:shadow-none"
            >
              Sign up <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Magnetic>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        {user.plan === 'PRO' ? (
          <ShimmerButton className="h-8 px-4 text-xs font-bold" shimmerColor="#fbbf24" background="#27272a">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-amber-100">PRO</span>
            </div>
          </ShimmerButton>
        ) : (
          <div className="flex items-center gap-3">
            <ShinyBadge text="FREE" className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400" />
            <Link to="/pricing">
              <RainbowButton className="h-8 px-4 text-xs font-bold">
                UPGRADE
              </RainbowButton>
            </Link>
          </div>
        )}

        {user.role === 'ADMIN' && (
          <Link to="/admin" title="Admin Dashboard">
            <button className="flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Admin
            </button>
          </Link>
        )}

        <Link to="/profile" title="View Profile">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white dark:ring-zinc-900"
            title={user.email}
          >
            {getUserInitials()}
          </motion.button>
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-zinc-400 transition-colors hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        style={{
          width: navWidth,
          marginTop: navTop,
          borderRadius: navBorderRadius,
        }}
        className={`pointer-events-auto transition-all duration-500 ${scrolled
          ? "glass border border-white/20 dark:border-white/10 shadow-2xl shadow-black/5"
          : "bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-white/10 dark:border-white/5"
          }`}
      >
        <div className="mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          {/* Left: Brand */}
          <div className="flex items-center gap-10">
            <Link to="/" className="group flex items-center gap-2">
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Send className="relative h-6 w-6 text-indigo-600 dark:text-indigo-400 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-12" strokeWidth={2.5} />
                </div>
                <span className="ml-2 text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                  PDF<span className="text-indigo-600 dark:text-indigo-400">ly</span>
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden items-center gap-2 lg:flex">
              <NavLink to="/merge">Merge</NavLink>
              <NavLink to="/split">Split</NavLink>
              <NavLink to="/compress">Compress</NavLink>
              {/* Conversion Link (Leads to Home, or a specific tool) */}
              <NavLink to="/" active={false}>Convert</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <NavLink to="/history">History</NavLink>
            </div>
          </div>

          {/* Right: Auth & Theme */}
          <div className="flex items-center gap-6">
            <AuthButtons />
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <ThemeToggle />
            <button className="block lg:hidden text-zinc-900 dark:text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.nav>
    </div>
  );
}