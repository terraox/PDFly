"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Icons } from "@/components/icons";

/**
 * =============================================================================
 * HERO ANIMATION - Logo flies in from left and lands in the center
 * =============================================================================
 * 
 * The main logo flies along a curved path from left to center, leaving a 
 * visible dashed trail. Once it lands, it stays in position.
 * 
 * =============================================================================
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    /** Animation duration in milliseconds (one-time flight) */
    duration: 2500,
    /** Path stroke width */
    strokeWidth: 1.5,
    /** Path stroke color (muted gray) */
    strokeColor: "rgba(148, 163, 184, 0.35)",
    /** Dash pattern for the path */
    dashArray: "6 4",
};

// =============================================================================
// ANIMATION UTILITIES
// =============================================================================

/**
 * Calculates the rotation angle at a given point on the path
 */
function getAngleAtLength(
    path: SVGPathElement,
    length: number,
    totalLength: number
): number {
    const delta = 1;
    const point1 = path.getPointAtLength(Math.max(0, length - delta));
    const point2 = path.getPointAtLength(Math.min(totalLength, length + delta));
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Ease-out cubic for smooth deceleration as it lands
 */
function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function HeroAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const logoContainerRef = useRef<HTMLDivElement>(null);

    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const [hasLanded, setHasLanded] = useState(false);

    // The flight path - starts from far left, curves up and lands at center (500, 100)
    const flightPath = "M -50,100 C 100,180 300,20 500,100";

    // =============================================================================
    // ANIMATION LOOP - Runs once on mount
    // =============================================================================

    const animate = useCallback((timestamp: number) => {
        if (!pathRef.current || !logoContainerRef.current) return;

        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / CONFIG.duration, 1);
        const easedProgress = easeOutCubic(progress);

        const totalLength = pathRef.current.getTotalLength();
        const currentLength = easedProgress * totalLength;
        const point = pathRef.current.getPointAtLength(currentLength);
        const angle = getAngleAtLength(pathRef.current, currentLength, totalLength);

        // Calculate position relative to the center of the SVG viewBox
        // ViewBox is 1000 wide, so center is at 500
        // We need to convert SVG coordinates to percentage of container width
        const xPercent = (point.x / 1000) * 100;
        const yOffset = point.y - 100; // 100 is the center Y in our viewBox

        // Apply transform
        logoContainerRef.current.style.transform = `translateX(${xPercent - 50}%) translateY(${yOffset}px) rotate(${angle}deg)`;
        logoContainerRef.current.style.opacity = `${Math.min(progress * 3, 1)}`;

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            // Animation complete - logo has landed
            setHasLanded(true);
            // Reset transform to final centered position
            logoContainerRef.current.style.transform = 'translateX(0) translateY(0) rotate(0deg)';
        }
    }, []);

    useEffect(() => {
        // Start the animation
        animationRef.current = requestAnimationFrame(animate);

        return () => {
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
            className="relative w-full h-32 md:h-40 overflow-visible z-10 flex items-center justify-center"
            aria-hidden="true"
        >
            {/* Dashed flight path trail */}
            <svg
                className="absolute w-full h-full pointer-events-none"
                viewBox="0 0 1000 200"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
            >
                <path
                    ref={pathRef}
                    d={flightPath}
                    stroke={CONFIG.strokeColor}
                    strokeWidth={CONFIG.strokeWidth}
                    strokeDasharray={CONFIG.dashArray}
                    strokeLinecap="round"
                    fill="none"
                    style={{
                        opacity: hasLanded ? 0.3 : 0.5,
                        transition: "opacity 0.5s ease-out"
                    }}
                />
            </svg>

            {/* The flying logo - this is THE logo that lands in the center */}
            <div
                ref={logoContainerRef}
                className="relative group cursor-pointer"
                style={{
                    willChange: "transform",
                    opacity: 0  // Start invisible, animation will fade it in
                }}
            >
                <div className="absolute -inset-3 rounded-full bg-indigo-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icons.logo className="relative h-16 w-16 md:h-20 md:w-20 text-primary transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-12" />
            </div>
        </div>
    );
}
