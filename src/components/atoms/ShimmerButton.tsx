import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function ShimmerButton({
    children,
    className,
    ...props
}: ShimmerButtonProps) {
    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#7c3aed] px-6 py-3 text-white font-bold text-base shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-transparent transition-all hover:bg-[#6d28d9] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] hover:-translate-y-0.5 active:scale-95 cursor-pointer",
                className,
            )}
            {...props}
        >
            {/* Sliding light shimmer */}
            <div className="absolute inset-0 animate-shimmer-slide bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            {/* Content above the shimmer */}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </div>
    );
}
