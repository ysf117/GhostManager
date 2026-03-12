/**
 * BudgetWidget Molecule
 *
 * Displays budget utilization with a progress bar.
 * Dynamically calculates monthly spend from subscriptions using CurrencyContext.
 *
 * Color Logic:
 * - Amber-500: > 90% utilization (warning)
 * - Indigo-500: <= 90% utilization (safe)
 */

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";

interface BudgetWidgetProps {
    /** User's subscriptions for calculating spend */
    subscriptions: Subscription[];
    /** Budget limit */
    limit?: number;
}

export function BudgetWidget({
    subscriptions,
    limit = 500,
}: BudgetWidgetProps) {
    const { convertPrice, formatPrice, getCurrencySymbol } = useCurrency();

    // Calculate monthly spend from subscriptions
    const currentSpend = useMemo(() => {
        return subscriptions
            .filter((s) => s.status === SubscriptionStatus.ACTIVE && !s.is_trial)
            .reduce((total, sub) => {
                const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
                return total + convertPrice(cost, sub.currency);
            }, 0);
    }, [subscriptions, convertPrice]);

    // Calculate percentage
    const percentage = useMemo(() => {
        if (limit <= 0) return 0;
        return Math.min(100, (currentSpend / limit) * 100);
    }, [currentSpend, limit]);

    // Determine bar color based on percentage
    const isWarning = percentage > 90;
    const barColorClass = isWarning ? "bg-amber-500" : "bg-indigo-400";

    return (
        <div className="glass-card p-4 rounded-xl border-indigo-500/20">
            {/* Header */}
            <p className="text-xs text-muted-foreground mb-2">Budget Utilization</p>

            {/* Spend Amount */}
            <p className="text-[11px] text-foreground font-medium mb-2">
                {formatPrice(currentSpend)} spent{" "}
                <span className="text-muted-foreground">of {formatPrice(limit)} limit</span>
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full transition-all duration-500 ease-out", barColorClass)}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${percentage.toFixed(0)}% of budget used`}
                />
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-muted-foreground">
                    {percentage.toFixed(0)}% of budget used
                </p>
                {isWarning && (
                    <span className="text-[10px] font-bold text-amber-500">
                        Over budget
                    </span>
                )}
            </div>
        </div>
    );
}

export default BudgetWidget;
