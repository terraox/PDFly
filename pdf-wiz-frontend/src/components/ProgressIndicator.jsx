import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ProgressIndicator({ progress = 0, message = 'Processing...' }) {
    return (
        <div className="flex flex-col items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-24 h-24">
                {/* Background circle */}
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-zinc-200 dark:text-zinc-800"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-indigo-600"
                        initial={{ strokeDasharray: '0 251.2' }}
                        animate={{ strokeDasharray: `${(progress / 100) * 251.2} 251.2` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {progress > 0 && progress < 100 ? (
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                            {Math.round(progress)}%
                        </span>
                    ) : (
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    )}
                </div>
            </div>

            {/* Message */}
            <motion.p
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {message}
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </div>
        </div>
    );
}
