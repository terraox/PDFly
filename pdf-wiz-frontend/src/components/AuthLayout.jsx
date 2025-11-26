import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black overflow-hidden transition-colors duration-300">
      
      {/* Luxurious Background Pattern */}
      <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] pointer-events-none" />
      
      {/* Animated Gradient Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] p-4"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 hover:scale-105 transition-transform group">
            <Send className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            <span className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              PDF<span className="text-indigo-600 dark:text-indigo-400">ly</span>
            </span>
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">{subtitle}</p>
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/60 border border-white/20 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 rounded-2xl p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}