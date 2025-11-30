import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Send, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { ShinyBadge } from "./ui/ShinyBadge";
import { AnimatedShinyText } from "./ui/AnimatedShinyText";
import { ShimmerButton } from "./ui/ShimmerButton";
import { RainbowButton } from "./ui/RainbowButton";
import { ShineBorder } from "./ui/ShineBorder";
import { ShinyButton } from "./ui/ShinyButton";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
      // Use the first two letters of the email (before @)
      return user.email.split('@')[0].substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  // --- Dynamic Auth Section ---
  const AuthButtons = () => {
    if (!isAuthenticated) {
      // Show Login/Signup
      return (
        <div className="hidden items-center gap-6 sm:flex">
          <Link to="/login" className="text-[15px] font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Log in
          </Link>
          <Link
            to="/register"
            className="shine-effect relative rounded-full bg-zinc-900 px-6 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-zinc-500/20 transition-transform hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-black dark:shadow-none"
          >
            Sign up
          </Link>
        </div>
      );
    }

    // Show Profile/Logout
    return (
      <div className="flex items-center gap-4">
        {user.plan === 'PRO' ? (
          <ShimmerButton className="h-8 px-4 text-xs font-bold" shimmerColor="#fbbf24" background="rgba(0, 0, 0, 1)">
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

        {/* Profile Avatar Button - Links to /profile */}
        <Link to="/profile" title="View Profile">
          <button className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:ring-2 ring-indigo-400/50" title={user.email}>
            {getUserInitials()}
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-full p-2 text-zinc-500 transition-colors hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // --- Main Navbar Structure ---
  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-transparent border-transparent"
        }`}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">

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

          {/* Desktop Links - FIXED LINKS */}
          <div className="hidden items-center gap-8 text-[15px] font-medium text-zinc-500 dark:text-zinc-400 lg:flex">

            {/* Direct Tool Links */}
            <Link to="/merge" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Merge PDF</Link>
            <Link to="/split" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Split PDF</Link>
            <Link to="/compress" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Compress PDF</Link>

            {/* Conversion Link (Leads to Home, or a specific tool) */}
            <Link to="/" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Convert PDF</Link>

            {/* Pricing Link */}
            <Link to="/pricing" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-indigo-600 dark:text-indigo-400">Pricing</Link>

            {/* History Link */}
            <Link to="/history" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">History</Link>
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
    </nav>
  );
}