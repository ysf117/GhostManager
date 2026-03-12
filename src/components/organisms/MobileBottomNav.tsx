/**
 * MobileBottomNav Organism
 *
 * Fixed bottom navigation bar for mobile dashboard.
 * Native-app style with 4 tabs and neon active indicator.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavTab {
    icon: string;
    label: string;
    href: string;
}

const MOBILE_NAV_TABS: NavTab[] = [
    { icon: "home", label: "Dashboard", href: "/dashboard" },
    { icon: "credit_card", label: "Subs", href: "/subscriptions" },
    { icon: "account_balance_wallet", label: "Payments", href: "/payments" },
    { icon: "bar_chart", label: "Reports", href: "/reports" },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 md:hidden">
            <div className="flex items-center justify-around h-full px-2">
                {MOBILE_NAV_TABS.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all ${
                                isActive
                                    ? "text-purple-400"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <span
                                className={`material-symbols-outlined text-2xl ${
                                    isActive
                                        ? "drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        : ""
                                }`}
                            >
                                {tab.icon}
                            </span>
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
