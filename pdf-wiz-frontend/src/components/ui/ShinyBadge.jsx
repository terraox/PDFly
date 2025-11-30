import React from "react";
import { motion } from "framer-motion";

export const ShinyBadge = ({ text = "PRO", className = "" }) => {
    return (
        <motion.div
            initial={{ "--x": "100%", scale: 1 }}
            animate={{ "--x": "-100%" }}
            whileTap={{ scale: 0.97 }}
            transition={{
                repeat: Infinity,
                repeatType: "loop",
                repeatDelay: 1,
                type: "spring",
                stiffness: 20,
                damping: 15,
                mass: 2,
                scale: {
                    type: "spring",
                    stiffness: 10,
                    damping: 5,
                    mass: 0.1,
                },
            }}
            className={`relative rounded-full px-3 py-1 text-xs font-medium radial-gradient cursor-pointer overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 ${className}`}
        >
            <span className="relative z-10 flex items-center gap-1 tracking-wide">
                {text}
            </span>
            <span
                className="absolute inset-0 z-0 block rounded-full bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.10)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.10)_0%,transparent_60%)]"
                style={{
                    maskImage:
                        "linear-gradient(-75deg,hsl(var(--primary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--primary)) calc(var(--x) + 100%))",
                }}
            />
            <span
                className="absolute inset-0 z-0 block rounded-full bg-[linear-gradient(-75deg,hsl(var(--primary)/0.1)_calc(var(--x)+20%),hsl(var(--primary)/0.5)_calc(var(--x)+25%),hsl(var(--primary)/0.1)_calc(var(--x)+100%))]"
                style={{
                    mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                }}
            />
        </motion.div>
    );
};
