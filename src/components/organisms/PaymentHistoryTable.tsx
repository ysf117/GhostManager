/**
 * PaymentHistoryTable Organism
 *
 * Projects past payment transactions from subscription data.
 * Since individual transactions are not stored in the DB, this component
 * generates a history by iterating from each subscription's start_date
 * to today based on its billing_cycle.
 *
 * Columns: Date, Service (avatar + name), Amount, Status
 * Limited to the most recent 50 transactions.
 */

"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Subscription, BillingCycle, SubscriptionStatus, Currency } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/utils";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/atoms/table";

interface PaymentHistoryTableProps {
    subscriptions: Subscription[];
}

interface Transaction {
    id: string;
    date: Date;
    serviceName: string;
    amount: number;
    currency: Currency;
    billingCycle: BillingCycle;
}

// Avatar colors based on first letter
const AVATAR_COLORS = [
    { bg: "bg-indigo-500/20", border: "border-indigo-500/30", text: "text-indigo-400" },
    { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400" },
    { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" },
    { bg: "bg-rose-500/20", border: "border-rose-500/30", text: "text-rose-400" },
    { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
    { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-400" },
];

function getAvatarColor(name: string) {
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

/**
 * Generate projected payment history from subscriptions.
 *
 * For each subscription, iterate from start_date to today
 * generating a Transaction for each billing cycle that occurred.
 */
function generateHistory(subscriptions: Subscription[]): Transaction[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const transactions: Transaction[] = [];

    for (const sub of subscriptions) {
        // Skip trials (no actual payments)
        if (sub.is_trial) continue;

        const startDate = new Date(sub.start_date);
        const current = new Date(startDate);
        let index = 0;

        while (current <= today) {
            transactions.push({
                id: `${sub.id}-${index}`,
                date: new Date(current),
                serviceName: sub.service_name,
                amount: sub.cost,
                currency: sub.currency,
                billingCycle: sub.billing_cycle,
            });

            // Advance to next billing cycle
            if (sub.billing_cycle === BillingCycle.MONTHLY) {
                current.setMonth(current.getMonth() + 1);
            } else {
                current.setFullYear(current.getFullYear() + 1);
            }
            index++;
        }
    }

    // Sort newest first
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Limit to 50
    return transactions.slice(0, 50);
}

export function PaymentHistoryTable({ subscriptions }: PaymentHistoryTableProps) {
    const { convertPrice, formatPrice } = useCurrency();

    const transactions = useMemo(
        () => generateHistory(subscriptions),
        [subscriptions]
    );

    // Calculate total of displayed transactions in user's currency
    const displayedTotal = useMemo(() => {
        return transactions.reduce((sum, tx) => {
            return sum + convertPrice(tx.amount, tx.currency);
        }, 0);
    }, [transactions, convertPrice]);

    if (transactions.length === 0) {
        return (
            <div className="glass-card rounded-2xl border border-border p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-muted-foreground/50 mb-3 block">
                    receipt_long
                </span>
                <p className="text-muted-foreground text-sm">
                    No payment history yet. Payments will appear here as your subscriptions renew.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {transactions.length} most recent transactions
                </p>
                <p className="text-sm text-foreground font-semibold">
                    Total: {formatPrice(displayedTotal)}
                </p>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                Date
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                                Service
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                                Amount
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => {
                            const avatarColor = getAvatarColor(tx.serviceName);
                            const firstLetter = tx.serviceName.charAt(0).toUpperCase();

                            return (
                                <TableRow key={tx.id}>
                                    {/* Date */}
                                    <TableCell className="px-6 py-4">
                                        <div>
                                            <p className="text-foreground text-sm font-medium">
                                                {format(tx.date, "MMM d, yyyy")}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {format(tx.date, "EEEE")}
                                            </p>
                                        </div>
                                    </TableCell>

                                    {/* Service */}
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`size-9 rounded-lg ${avatarColor.bg} ${avatarColor.border} border flex items-center justify-center ${avatarColor.text} font-bold text-sm`}
                                            >
                                                {firstLetter}
                                            </div>
                                            <div>
                                                <p className="text-foreground text-sm font-medium">
                                                    {tx.serviceName}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {tx.billingCycle === BillingCycle.MONTHLY ? "Monthly" : "Yearly"}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Amount */}
                                    <TableCell className="px-6 py-4 text-right">
                                        <span className="text-foreground text-sm font-semibold">
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </span>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Paid
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
