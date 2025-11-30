import React, { useEffect, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useVelocity,
    AnimatePresence
} from "framer-motion";
import { useTheme } from "next-themes";

export const SmoothCursor = () => {
    const { theme } = useTheme();
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    // Refined spring configuration for "natural" feel
    // High stiffness and lower mass for snappy response, adequate damping to prevent overshoot
    const springConfig = { damping: 35, stiffness: 1500, mass: 0.1 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isClicking, setIsClicking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Velocity for rotation
    const velocityX = useVelocity(cursorXSpring);
    const velocityY = useVelocity(cursorYSpring);

    // Smooth out the rotation values
    const smoothVelocityX = useSpring(velocityX, { damping: 50, stiffness: 400 });
    const smoothVelocityY = useSpring(velocityY, { damping: 50, stiffness: 400 });

    // Calculate rotation based on velocity
    // Reduced rotation range for more subtle, natural effect
    const rotateX = useTransform(smoothVelocityY, [-1000, 1000], [20, -20]);
    const rotateY = useTransform(smoothVelocityX, [-1000, 1000], [-20, 20]);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        // Check for hoverable elements
        const handleMouseOver = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a') || e.target.classList.contains('cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);
        document.body.addEventListener("mouseleave", handleMouseLeave);
        document.body.addEventListener("mouseenter", handleMouseEnter);

        // Force hide default cursor via JS
        document.documentElement.style.cursor = 'none';
        document.body.style.cursor = 'none';

        // Add a style tag to force it everywhere
        const style = document.createElement('style');
        style.id = 'cursor-hider';
        style.innerHTML = `* { cursor: none !important; }`;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            document.body.removeEventListener("mouseenter", handleMouseEnter);

            // Cleanup
            document.documentElement.style.cursor = '';
            document.body.style.cursor = '';
            const existingStyle = document.getElementById('cursor-hider');
            if (existingStyle) existingStyle.remove();
        };
    }, [cursorX, cursorY, isVisible]);

    // Determine colors based on theme
    // In dark mode: White fill, Black stroke
    // In light mode: Black fill, White stroke
    const isDark = theme === 'dark';
    const fill = isDark ? "white" : "black";
    const stroke = isDark ? "black" : "white";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-0 left-0 pointer-events-none z-[9999]"
                    style={{
                        translateX: cursorXSpring,
                        translateY: cursorYSpring,
                        x: "-50%",
                        y: "-50%",
                        rotate: rotateY, // Apply rotation based on X velocity
                    }}
                >
                    <motion.div
                        animate={{
                            scale: isClicking ? 0.8 : isHovering ? 1.2 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        {/* Mac-style Arrow Cursor SVG */}
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-lg"
                        >
                            <path
                                d="M5.5 3.5L11.5 20.5L14.5 13.5L21.5 10.5L5.5 3.5Z"
                                fill={fill}
                                stroke={stroke}
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
