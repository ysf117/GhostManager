/**
 * GlassCard Atom
 *
 * A glassmorphism card with the cyberpunk aesthetic.
 * Used as the primary container on mobile views.
 */

import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
    return (
        <div
            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl ${className}`}
        >
            {children}
        </div>
    );
}
