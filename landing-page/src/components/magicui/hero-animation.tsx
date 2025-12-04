"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Icons } from "@/components/icons";

/**
 * =============================================================================
 * HERO ANIMATION - Notion Mail Inspired
 * =============================================================================
 * 
 * The logo flies smoothly from left to center along a gentle curve.
 * No wobble, no rotation - just a clean, elegant entry animation.
 * 
 * =============================================================================
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    duration: 1800, // Smooth, not too fast
    strokeColor: "rgba(148, 163, 184, 0.3)",
    strokeWidth: 1.5,
    dashArray: "8 6",
};

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Ease-out quart - very smooth deceleration, feels natural
 */
function easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function HeroAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<SVGPathElement>(null);

    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const [hasLanded, setHasLanded] = useState(false);

    // Smooth curved path from left to exact center
    // The path ends at 500,100 which is the center of viewBox (1000x200)
    const flightPath = "M -100,100 Q 200,160 500,100";

    // =============================================================================
    // ANIMATION LOOP - Runs once on mount
    // =============================================================================

    const animate = useCallback((timestamp: number) => {
        if (!pathRef.current || !logoRef.current || !trailRef.current) return;

        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / CONFIG.duration, 1);
        const easedProgress = easeOutQuart(progress);

        const totalLength = pathRef.current.getTotalLength();
        const currentLength = easedProgress * totalLength;
        const point = pathRef.current.getPointAtLength(currentLength);

        // Convert SVG coordinates to screen position
        // ViewBox is 1000 wide, center is 500
        // We want the logo centered when point.x = 500
        const xPercent = ((point.x - 500) / 1000) * 100;
        const yOffset = (point.y - 100) * 0.5; // Reduce vertical movement

        // Apply transform - NO ROTATION, just smooth translation
        logoRef.current.style.transform = `translateX(${xPercent}%) translateY(${yOffset}px)`;
        logoRef.current.style.opacity = `${Math.min(progress * 2, 1)}`;

        // Animate the trail to follow the logo
        const trailLength = currentLength;
        trailRef.current.style.strokeDasharray = `${trailLength} ${totalLength}`;

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            // Animation complete - snap to final position
            setHasLanded(true);
            logoRef.current.style.transform = 'translateX(0) translateY(0)';
            logoRef.current.style.opacity = '1';
        }
    }, []);

    useEffect(() => {
        // Small delay before starting animation for page load
        const timeout = setTimeout(() => {
            animationRef.current = requestAnimationFrame(animate);
        }, 200);

        return () => {
            clearTimeout(timeout);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    // =============================================================================
    // RENDER
    // =============================================================================

    return (
        <div
            ref={containerRef}
            className="relative w-full h-28 md:h-36 overflow-visible z-10 flex items-center justify-center"
            aria-hidden="true"
        >
            {/* Flight path trail */}
            <svg
                className="absolute w-full h-full pointer-events-none"
                viewBox="0 0 1000 200"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
            >
                {/* Hidden path for calculations */}
                <path
                    ref={pathRef}
                    d={flightPath}
                    stroke="transparent"
                    fill="none"
                />

                {/* Visible animated trail */}
                <path
                    ref={trailRef}
                    d={flightPath}
                    stroke={CONFIG.strokeColor}
                    strokeWidth={CONFIG.strokeWidth}
                    strokeDasharray="0 1000"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        opacity: hasLanded ? 0 : 1,
                        transition: hasLanded ? "opacity 1s ease-out" : "none"
                    }}
                />
            </svg>

            {/* The logo - flies in and lands */}
            <div
                ref={logoRef}
                className="relative group cursor-pointer"
                style={{
                    willChange: "transform, opacity",
                    opacity: 0
                }}
            >
                <div className="absolute -inset-3 rounded-full bg-indigo-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icons.logo className="relative h-16 w-16 md:h-20 md:w-20 text-primary transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-12" />
            </div>
        </div>
    );
}
