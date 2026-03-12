"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    /** Maximum rotation in degrees */
    maxTilt?: number;
    /** CSS perspective distance in px */
    perspective?: number;
}

export function TiltCard({
    children,
    className,
    maxTilt = 10,
    perspective = 1000,
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Normalized mouse position (0–1), default to center
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Map mouse position to rotation, then smooth with spring
    const rotateX = useSpring(
        useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]),
        { stiffness: 150, damping: 20 },
    );
    const rotateY = useSpring(
        useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]),
        { stiffness: 150, damping: 20 },
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div
            ref={ref}
            style={{ perspective }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className={className}
                style={{ rotateX, rotateY }}
            >
                {children}
            </motion.div>
        </div>
    );
}
