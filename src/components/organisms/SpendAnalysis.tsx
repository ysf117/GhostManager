/**
 * SpendAnalysis Organism
 * 
 * Displays key metrics about subscription spending.
 * Uses CurrencyContext to convert and format all currency values.
 */

"use client";

import { useMemo } from "react";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SpendAnalysisProps {
    subscriptions: Subscription[];
}

export function SpendAnalysis({ subscriptions }: SpendAnalysisProps) {
    const { convertPrice, formatPrice } = useCurrency();

    // Calculate stats with dynamic currency conversion
    const stats = useMemo(() => {
        const activeSubscriptions = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE);

        // Calculate first day of current month for "new spend" calculation
        const startOfCurrentMonth = new Date();
        startOfCurrentMonth.setDate(1);
        startOfCurrentMonth.setHours(0, 0, 0, 0);

        let totalMonthlySpend = 0;
        let newSpendThisMonth = 0;

        // Calculate totals
        activeSubscriptions.forEach((sub) => {
            // Free trials don't contribute to current monthly spend
            if (sub.is_trial) return;

            const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
            const convertedCost = convertPrice(cost, sub.currency);

            totalMonthlySpend += convertedCost;

            // If subscription started this month, it counts as new spend
            if (new Date(sub.start_date) >= startOfCurrentMonth) {
                newSpendThisMonth += convertedCost;
            }
        });

        // Find next renewal
        const sortedByDate = [...activeSubscriptions].sort((a, b) => {
            const dateA = a.is_trial && a.trial_end_date ? new Date(a.trial_end_date) : new Date(a.next_billing_date);
            const dateB = b.is_trial && b.trial_end_date ? new Date(b.trial_end_date) : new Date(b.next_billing_date);
            return dateA.getTime() - dateB.getTime();
        });
        const nextRenewal = sortedByDate[0];

        // Format next renewal date
        const nextDate = nextRenewal
            ? (nextRenewal.is_trial && nextRenewal.trial_end_date
                ? new Date(nextRenewal.trial_end_date)
                : new Date(nextRenewal.next_billing_date))
            : null;

        const nextRenewalDate = nextDate
            ? nextDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })
            : "N/A";

        return {
            activeCount: activeSubscriptions.length,
            totalMonthlySpend,
            nextRenewal,
            nextRenewalDate,
            newSpendThisMonth,
        };
    }, [subscriptions, convertPrice]);

    return (
        <>
            {/* Mobile: Horizontal snap scroll */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 -mx-4 pb-4 no-scrollbar md:hidden">
                <div className="stat-card min-w-[160px] flex-shrink-0 snap-center">
                    <p className="text-muted-foreground text-sm font-medium">Active Subs</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {stats.activeCount}
                        </h3>
                    </div>
                </div>

                <div className="stat-card min-w-[160px] flex-shrink-0 snap-center">
                    <p className="text-muted-foreground text-sm font-medium">Next Renewal</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {stats.nextRenewalDate}
                        </h3>
                        {stats.nextRenewal && (
                            <span className="badge-primary">
                                {stats.nextRenewal.service_name.split(" ")[0]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="stat-card min-w-[160px] flex-shrink-0 snap-center">
                    <p className="text-muted-foreground text-sm font-medium">Monthly Total</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {formatPrice(stats.totalMonthlySpend)}
                        </h3>
                        {stats.newSpendThisMonth > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
                                +{formatPrice(stats.newSpendThisMonth)} new
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Active Subs</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {stats.activeCount}
                        </h3>
                    </div>
                </div>

                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Next Renewal</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {stats.nextRenewalDate}
                        </h3>
                        {stats.nextRenewal && (
                            <span className="badge-primary">
                                {stats.nextRenewal.service_name.split(" ")[0]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Monthly Total</p>
                    <div className="flex items-end justify-between mt-2">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {formatPrice(stats.totalMonthlySpend)}
                        </h3>
                        {stats.newSpendThisMonth > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
                                +{formatPrice(stats.newSpendThisMonth)} new
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SpendAnalysis;
