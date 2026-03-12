/**
 * Sidebar Component
 *
 * Reusable navigation sidebar for the dashboard.
 * Used in both the desktop layout and mobile drawer.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BudgetWidget } from "@/components/molecules/BudgetWidget";
import { GhostLogo } from "@/components/atoms/GhostLogo";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { Subscription } from "@/types/database";

interface SidebarProps {
    className?: string;
    subscriptions?: Subscription[];
    budgetLimit?: number;
    onNavigate?: () => void;
    showLogo?: boolean;
}

export function Sidebar({
    className = "",
    subscriptions = [],
    budgetLimit,
    onNavigate,
    showLogo = true,
}: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={`flex flex-col ${className}`}>
            {showLogo && (
                <div className="px-6 pt-5 pb-2">
                    <GhostLogo className="h-10 w-auto" />
                </div>
            )}

            <nav className="flex-1 px-4 mt-4 space-y-1">
                {DASHBOARD_NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                                isActive
                                    ? "bg-[#3d40f0]/10 text-[#3d40f0]"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6">
                <BudgetWidget subscriptions={subscriptions} limit={budgetLimit} />
            </div>
        </div>
    );
}

export default Sidebar;
