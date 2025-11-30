import React from "react";
import { cn } from "../../lib/utils";

export const RainbowButton = React.forwardRef(({
    children,
    className,
    ...props
}, ref) => {
    return (
        <div className="group relative inline-flex cursor-pointer items-center justify-center rounded-xl">
            {/* Rainbow Gradient Background (acting as border/glow) */}
            <div className="absolute -inset-[2px] -z-10 animate-rainbow rounded-xl bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%] transition-all group-hover:blur-sm opacity-100" />

            {/* Inner Content Container */}
            <div
                ref={ref}
                className={cn(
                    "relative inline-flex h-8 items-center justify-center rounded-[10px] bg-white px-4 py-1 text-xs font-bold text-black transition-colors dark:bg-zinc-950 dark:text-white",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    );
});
RainbowButton.displayName = "RainbowButton";
