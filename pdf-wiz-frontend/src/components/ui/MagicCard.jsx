import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function MagicCard({
    children,
    className = "",
    gradientSize = 200,
    gradientColor = "#262626",
    gradientOpacity = 0.8,
}) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);
    const { theme } = useTheme();

    // Adjust gradient color based on theme if not explicitly provided
    const effectiveGradientColor = theme === 'dark' ? '#262626' : '#e5e7eb';

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 ${className}`}
        >
            {/* Border Glow Layer */}
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(${gradientSize}px circle at ${position.x}px ${position.y}px, ${effectiveGradientColor}, transparent 100%)`,
                }}
            />

            {/* Content Mask Layer */}
            <div className="relative z-10 h-full rounded-[11px] bg-white dark:bg-zinc-950 m-[1px]">
                {children}
            </div>
        </div>
    );
}
