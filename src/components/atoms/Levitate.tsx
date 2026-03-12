"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface LevitateProps {
    children: ReactNode;
    className?: string;
}

export function Levitate({ children, className }: LevitateProps) {
    return (
        <motion.div
            className={className}
            animate={{ y: [0, -15, 0] }}
            transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}
