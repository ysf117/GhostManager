/**
 * SubscriptionRow Molecule
 * 
 * Displays a single subscription in a row format with:
 * - Service avatar (first letter)
 * - Service name and category
 * - Cost and billing status
 * - Color-coded based on billing urgency
 * 
 * Color Logic:
 * - Red-500: Overdue (next_billing_date in the past)
 * - Amber-500: Due within 3 days
 * - Zinc-400: Normal
 */

"use client";

import { useMemo } from "react";
import { Bell } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { Subscription, Currency, BillingCycle, SubscriptionStatus } from "@/types/database";
import { cn, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SubscriptionRowProps {
    subscription: Subscription;
    onClick?: () => void;
}

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<Currency, string> = {
    [Currency.USD]: "$",
    [Currency.EUR]: "€",
    [Currency.GBP]: "£",
};

// Avatar background colors based on first letter hash
const AVATAR_COLORS = [
    { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-400" },
    { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400" },
    { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" },
    { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-400" },
    { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
    { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-400" },
];

/**
 * Get billing status and color based on next_billing_date
 */
/**
 * Get billing status and color based on subscription state
 */
function getBillingStatus(subscription: Subscription) {
    const { next_billing_date, status, is_trial, trial_end_date } = subscription;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If paused, show paused status
    if (status === SubscriptionStatus.PAUSED) {
        return {
            label: "Paused",
            colorClass: "text-zinc-500",
            badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
            isOverdue: false,
            isDueSoon: false,
        };
    }

    // Trial Logic
    if (is_trial && trial_end_date) {
        const endDate = new Date(trial_end_date);
        const daysUntil = differenceInDays(endDate, today);

        if (daysUntil < 0) {
            return {
                label: "Trial Ended",
                colorClass: "text-red-500",
                badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
                isOverdue: true,
                isDueSoon: false,
            };
        }

        return {
            label: daysUntil === 0 ? "Trial ends today" : `Trial: ${daysUntil} days left`,
            colorClass: "text-blue-400", // Blue for trial
            badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            isOverdue: false,
            isDueSoon: daysUntil <= 3, // Highlight if ending soon
        };
    }

    const billingDate = new Date(next_billing_date);
    const daysUntil = differenceInDays(billingDate, today);

    // Overdue - past due date
    if (isPast(billingDate) && daysUntil < 0) {
        return {
            label: `${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? "s" : ""} overdue`,
            colorClass: "text-red-500",
            badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
            isOverdue: true,
            isDueSoon: false,
        };
    }

    // Due soon - within 3 days
    if (daysUntil >= 0 && daysUntil <= 3) {
        const label = daysUntil === 0 ? "Due today" : `Due in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
        return {
            label,
            colorClass: "text-amber-500",
            badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            isOverdue: false,
            isDueSoon: true,
        };
    }

    // Normal - auto-pay enabled
    return {
        label: "Auto-pay ON",
        colorClass: "text-emerald-500",
        badgeClass: null,
        isOverdue: false,
        isDueSoon: false,
    };
}

export function SubscriptionRow({ subscription, onClick }: SubscriptionRowProps) {
    const {
        service_name,
        cost,
        currency,
        billing_cycle,
        status,
        category,
        reminder_days,
    } = subscription;

    const { showMonthlyCosts } = useCurrency();

    // Calculate billing status
    const billingStatus = useMemo(
        () => getBillingStatus(subscription),
        [subscription]
    );

    // Get avatar color based on first letter
    const firstLetter = service_name.charAt(0).toUpperCase();
    const colorIndex = firstLetter.charCodeAt(0) % AVATAR_COLORS.length;
    const avatarColor = billingStatus.isOverdue
        ? { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-500" }
        : AVATAR_COLORS[colorIndex];

    // Format cost - show monthly equivalent for yearly subs when preference is on
    const displayCost = showMonthlyCosts && billing_cycle === BillingCycle.YEARLY ? cost / 12 : cost;
    const formattedCost = formatCurrency(displayCost, currency);
    const isShowingMonthly = showMonthlyCosts && billing_cycle === BillingCycle.YEARLY;

    // Format billing cycle
    const cycleLabel = billing_cycle === BillingCycle.MONTHLY ? "Monthly" : "Yearly";

    return (
        <div
            className={cn(
                "p-6 flex items-center gap-4 hover:bg-accent transition-colors cursor-pointer",
                status === SubscriptionStatus.PAUSED && "opacity-60"
            )}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "size-12 rounded-full border flex items-center justify-center font-bold text-lg",
                    avatarColor.bg,
                    avatarColor.border,
                    avatarColor.text
                )}
            >
                {firstLetter}
            </div>

            {/* Service Info */}
            <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm truncate">{service_name}</p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{category || "Other"}</span>
                    <span>•</span>
                    <span>{status === SubscriptionStatus.PAUSED ? "Paused" : cycleLabel}</span>
                </div>
            </div>

            {/* Cost & Status */}
            <div className="text-right flex-shrink-0">
                <p className="text-foreground font-bold text-sm">
                    {formattedCost}
                    {isShowingMonthly && <span className="text-muted-foreground font-normal text-xs">/mo</span>}
                </p>

                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    {reminder_days && reminder_days > 0 && (
                        <Bell size={12} className="text-muted-foreground" />
                    )}

                    {billingStatus.badgeClass ? (
                        <span
                            className={cn(
                                "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                billingStatus.badgeClass
                            )}
                        >
                            {billingStatus.label}
                        </span>
                    ) : (
                        <p className={cn("text-[10px] font-bold", billingStatus.colorClass)}>
                            {billingStatus.label}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SubscriptionRow;
