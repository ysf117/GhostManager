"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BlurFadeProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function BlurFade({
    children,
    className,
    delay = 0,
    duration = 0.8,
}: BlurFadeProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, filter: "blur(10px)", y: 16 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{
                duration,
                delay,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}
