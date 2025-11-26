import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Send } from "lucide-react"; // Using 'Send' for the paper plane look
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass shadow-sm" : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-10">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex items-center">
              <div className="relative">
                {/* Glow Effect behind the plane */}
                <div className="absolute -inset-2 rounded-full bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Send className="relative h-6 w-6 text-indigo-600 dark:text-indigo-400 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-12" strokeWidth={2.5} />
              </div>
              <span className="ml-2 text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                PDF<span className="text-indigo-600 dark:text-indigo-400">ly</span>
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 text-[15px] font-medium text-zinc-500 dark:text-zinc-400 lg:flex">
            <Link to="/merge" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Merge PDF</Link>
            <Link to="/split" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Split PDF</Link>
            <Link to="/compress" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Compress PDF</Link>
            <Link to="/pricing" className="relative transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-indigo-600 dark:text-indigo-400">Pricing</Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
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
          
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" /> 
          
          <ThemeToggle />
          
          <button className="block lg:hidden text-zinc-900 dark:text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}