"use client";

import { useEffect, useRef, useState } from "react";
import { Icons } from "@/components/icons";

/**
 * HERO ANIMATION - Notion Mail Style
 * Paper plane flies from left along an S-curve, with dotted trail drawing behind it
 * Lands smoothly in the center
 */

export default function HeroAnimation() {
    const pathRef = useRef<SVGPathElement>(null);
    const trailRef = useRef<SVGPathElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const path = pathRef.current;
        const trail = trailRef.current;
        const logo = logoRef.current;
        const container = containerRef.current;

        if (!path || !trail || !logo || !container) return;

        const totalLength = path.getTotalLength();
        const duration = 3000; // 3 seconds - smooth like Notion
        let startTime: number | null = null;
        let animationId: number;

        // Initialize trail as hidden
        trail.style.strokeDasharray = `${totalLength}`;
        trail.style.strokeDashoffset = `${totalLength}`;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth ease-out for natural deceleration
            const eased = 1 - Math.pow(1 - progress, 4);

            // Get point on path
            const point = path.getPointAtLength(eased * totalLength);

            // Calculate rotation angle based on path tangent
            const delta = 0.1;
            const p1 = path.getPointAtLength(Math.max(0, eased * totalLength - delta));
            const p2 = path.getPointAtLength(Math.min(totalLength, eased * totalLength + delta));
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

            // Map SVG coordinates to screen position
            // Path ends at x=600 (center of 1200 viewBox)
            const containerRect = container.getBoundingClientRect();
            const scaleX = containerRect.width / 1200;
            const scaleY = containerRect.height / 100;

            // Calculate screen position (600 = center)
            const screenX = (point.x - 600) * scaleX;
            const screenY = (point.y - 50) * scaleY;

            // Subtle rotation that decreases near the end
            const rotationFactor = progress < 0.8 ? 0.4 : 0.4 * (1 - (progress - 0.8) / 0.2);
            const rotation = angle * rotationFactor;

            // Apply transform
            logo.style.transform = `translate(${screenX}px, ${screenY}px) rotate(${rotation}deg)`;
            logo.style.opacity = progress < 0.1 ? `${progress * 10}` : '1';

            // Draw trail behind the logo
            trail.style.strokeDashoffset = `${totalLength * (1 - eased)}`;

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                // Snap to center with no rotation
                logo.style.transform = 'translate(0px, 0px) rotate(0deg)';
                logo.style.opacity = '1';
                setIsComplete(true);
            }
        };

        // Start after page settles
        const timeout = setTimeout(() => {
            animationId = requestAnimationFrame(animate);
        }, 400);

        return () => {
            clearTimeout(timeout);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // S-curve path: starts from left below center, curves up, then down to center
    // Similar to Notion Mail's elegant swooping motion
    const curvePath = "M -100 70 C 100 20, 300 80, 400 30 S 550 60, 600 50";

    return (
        <div
            ref={containerRef}
            className="relative w-full h-20 md:h-24 overflow-visible z-10 flex items-center justify-center"
            aria-hidden="true"
        >
            {/* SVG with S-curve path */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1200 100"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
            >
                {/* Hidden path for position calculations */}
                <path
                    ref={pathRef}
                    d={curvePath}
                    fill="none"
                    stroke="transparent"
                />

                {/* Visible dotted trail that draws as logo flies */}
                <path
                    ref={trailRef}
                    d={curvePath}
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.35)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="4 6"
                    style={{
                        opacity: isComplete ? 0 : 1,
                        transition: isComplete ? "opacity 2s ease-out" : "none"
                    }}
                />
            </svg>

            {/* The logo that flies and lands in center */}
            <div
                ref={logoRef}
                className="relative group cursor-pointer"
                style={{
                    willChange: "transform, opacity",
                    opacity: 0
                }}
            >
                <div className="absolute -inset-3 rounded-full bg-indigo-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icons.logo className="relative h-12 w-12 md:h-14 md:w-14 text-primary transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-12" />
            </div>
        </div>
    );
}
