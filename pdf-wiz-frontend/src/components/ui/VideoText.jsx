import { cn } from "../../lib/utils";
import { useEffect, useRef, useState } from "react";

export function VideoText({
    children,
    className,
    src,
    autoPlay = true,
    muted = true,
    loop = true,
    preload = "auto",
    fontSize = "120",
    fontWeight = "bold",
    textAnchor = "middle",
    dominantBaseline = "middle",
    fontFamily = "sans-serif",
    ...props
}) {
    return (
        <div className={cn("relative overflow-hidden", className)} {...props}>
            <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                preload={preload}
            >
                <source src={src} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-white dark:bg-black mix-blend-screen pointer-events-none">
                <svg className="h-full w-full">
                    <defs>
                        <mask id="text-mask" x="0" y="0" width="100%" height="100%">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <text
                                x="50%"
                                y="50%"
                                fontSize={fontSize}
                                fontWeight={fontWeight}
                                textAnchor={textAnchor}
                                dominantBaseline={dominantBaseline}
                                fontFamily={fontFamily}
                                fill="black"
                            >
                                {children}
                            </text>
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="black"
                        mask="url(#text-mask)"
                    />
                </svg>
            </div>
        </div>
    );
}
