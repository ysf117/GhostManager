/**
 * CategoryBreakdownTable Organism
 *
 * A summary table listing each subscription category with total monthly spend,
 * sorted by highest spend. Uses CurrencyContext for conversion and formatting.
 */

"use client";

import { useMemo } from "react";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CategoryBreakdownTableProps {
    subscriptions: Subscription[];
}

interface CategoryRow {
    category: string;
    totalMonthly: number;
    count: number;
    percentage: number;
}

const CATEGORY_COLORS: Record<string, string> = {
    Entertainment: "bg-violet-500",
    Productivity: "bg-blue-500",
    Development: "bg-emerald-500",
    Cloud: "bg-cyan-500",
    Music: "bg-pink-500",
    Finance: "bg-amber-500",
    Other: "bg-zinc-500",
};

function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || "bg-indigo-500";
}

export function CategoryBreakdownTable({ subscriptions }: CategoryBreakdownTableProps) {
    const { convertPrice, formatPrice } = useCurrency();

    const categories = useMemo(() => {
        const active = subscriptions.filter(
            (s) => s.status === SubscriptionStatus.ACTIVE && !s.is_trial
        );

        // Group by category
        const groups: Record<string, { total: number; count: number }> = {};

        active.forEach((sub) => {
            const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
            const converted = convertPrice(cost, sub.currency);
            const cat = sub.category || "Other";

            if (!groups[cat]) {
                groups[cat] = { total: 0, count: 0 };
            }
            groups[cat].total += converted;
            groups[cat].count += 1;
        });

        const grandTotal = Object.values(groups).reduce((sum, g) => sum + g.total, 0);

        const rows: CategoryRow[] = Object.entries(groups)
            .map(([category, { total, count }]) => ({
                category,
                totalMonthly: Math.round(total * 100) / 100,
                count,
                percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
            }))
            .sort((a, b) => b.totalMonthly - a.totalMonthly);

        return { rows, grandTotal };
    }, [subscriptions, convertPrice]);

    if (categories.rows.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                No active subscriptions to display
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Category
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Subs
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Monthly Spend
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground w-32">
                            Share
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {categories.rows.map((row) => (
                        <tr key={row.category} className="hover:bg-accent transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`size-2.5 rounded-full ${getCategoryColor(row.category)}`} />
                                    <span className="text-foreground text-sm font-medium">
                                        {row.category}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground text-sm">
                                {row.count}
                            </td>
                            <td className="px-4 py-3 text-right text-foreground text-sm font-semibold">
                                {formatPrice(row.totalMonthly)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getCategoryColor(row.category)}`}
                                            style={{ width: `${row.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground text-xs font-medium w-10 text-right">
                                        {row.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t border-border">
                        <td className="px-4 py-3 text-foreground text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-center text-muted-foreground text-sm font-medium">
                            {categories.rows.reduce((sum, r) => sum + r.count, 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground text-sm font-bold">
                            {formatPrice(categories.grandTotal)}
                        </td>
                        <td />
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
