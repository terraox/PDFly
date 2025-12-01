import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ProBadge({ className = "", size = "sm" }) {
    const sizeClasses = {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    return (
        <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/20 ${sizeClasses[size]} ${className}`}>
            <Sparkles className={size === 'sm' ? "h-3 w-3" : "h-3.5 w-3.5"} />
            <span>PRO</span>
        </div>
    );
}
