import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ComingSoon() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black transition-colors duration-300 font-sans overflow-hidden">
            <Navbar />

            <div className="relative min-h-screen flex items-center justify-center px-6">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30"
                    >
                        <Rocket className="h-12 w-12" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl"
                    >
                        Coming <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Soon</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-10 text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed"
                    >
                        We're working hard to bring you this powerful new feature.
                        Stay tuned for updates as we continue to make PDFly even better.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            to="/"
                            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-zinc-900 px-8 font-medium text-white transition-all duration-300 hover:bg-zinc-800 hover:scale-105 hover:ring-2 hover:ring-zinc-900 hover:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:ring-white dark:hover:ring-offset-zinc-950"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>

                        <button className="group inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm px-8 font-medium text-zinc-900 transition-all duration-300 hover:bg-zinc-100 hover:scale-105 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:hover:bg-zinc-800">
                            <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
                            Notify Me
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
