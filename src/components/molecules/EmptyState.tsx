/**
 * EmptyState Molecule
 * 
 * A reusable component for displaying "Coming Soon" or empty states.
 * Used for placeholder pages and empty data states.
 */

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Lucide React icon component */
    icon: LucideIcon;
    /** Show "Coming Soon" badge */
    showBadge?: boolean;
    /** Custom badge text */
    badgeText?: string;
    /** Additional className */
    className?: string;
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    showBadge = true,
    badgeText = "Coming Soon",
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-h-[400px] text-center px-6",
                className
            )}
        >
            {/* Icon Container */}
            <div className="relative mb-6">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-[#3d40f0]/20 to-[#3d40f0]/5 border border-[#3d40f0]/20 flex items-center justify-center">
                    <Icon className="size-10 text-[#3d40f0]" strokeWidth={1.5} />
                </div>
                {/* Decorative glow */}
                <div className="absolute inset-0 size-20 rounded-2xl bg-[#3d40f0]/10 blur-xl -z-10" />
            </div>

            {/* Badge */}
            {showBadge && (
                <span className="inline-flex items-center px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-[#3d40f0] bg-[#3d40f0]/10 border border-[#3d40f0]/20 rounded-full">
                    {badgeText}
                </span>
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>

            {/* Description */}
            {description && (
                <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}

export default EmptyState;
