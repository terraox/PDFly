import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { cn } from "../../lib/utils";

export default function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    className,
}) {
    const ref = useRef(null);
    const motionValue = useMotionValue(direction === "down" ? value : 0);
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView) {
            const controls = animate(motionValue, direction === "down" ? 0 : value, {
                duration: 2.5,
                ease: "easeOut",
                delay: delay,
            });
            return () => controls.stop();
        }
    }, [motionValue, isInView, delay, value, direction]);

    useEffect(() => {
        const unsubscribe = motionValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat("en-US").format(
                    latest.toFixed(0),
                );
            }
        });
        return () => unsubscribe();
    }, [motionValue]);

    return (
        <span
            className={cn(
                "inline-block tabular-nums text-black dark:text-white tracking-wider",
                className,
            )}
            ref={ref}
        />
    );
}
