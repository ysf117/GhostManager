/**
 * YearlyProjectionCard Organism
 *
 * A large metric card showing the projected yearly subscription spend
 * (Total Monthly Spend * 12). Uses CurrencyContext for conversion and formatting.
 */

"use client";

import { useMemo } from "react";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";

interface YearlyProjectionCardProps {
    subscriptions: Subscription[];
}

export function YearlyProjectionCard({ subscriptions }: YearlyProjectionCardProps) {
    const { convertPrice, formatPrice } = useCurrency();

    const { monthlyTotal, yearlyTotal } = useMemo(() => {
        const monthly = subscriptions
            .filter((s) => s.status === SubscriptionStatus.ACTIVE && !s.is_trial)
            .reduce((total, sub) => {
                const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
                return total + convertPrice(cost, sub.currency);
            }, 0);

        return {
            monthlyTotal: monthly,
            yearlyTotal: monthly * 12,
        };
    }, [subscriptions, convertPrice]);

    return (
        <div className="glass-card rounded-2xl border border-border p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3d40f0]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3d40f0]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#3d40f0]">calendar_today</span>
                    <p className="text-muted-foreground text-sm font-medium">Yearly Projection</p>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                    {formatPrice(yearlyTotal)}
                </h2>

                <p className="text-muted-foreground text-sm mt-3">
                    Based on {formatPrice(monthlyTotal)}/mo in active subscriptions
                </p>

                <p className="text-muted-foreground/70 text-xs mt-2 italic">
                    This is what you will spend in 1 year if you don&apos;t cancel anything.
                </p>
            </div>
        </div>
    );
}
