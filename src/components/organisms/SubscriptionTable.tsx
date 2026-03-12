/**
 * SubscriptionTable Component
 * 
 * A professional data table for managing subscriptions with:
 * - Search/filter functionality
 * - Delete capability with confirmation
 * - Responsive design
 * - Currency-aware formatting
 */

"use client";

import { useState, useTransition, useMemo } from "react";
import { Trash2, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { deleteSubscription } from "@/actions/delete-subscription";
import { EditSubscriptionDialog } from "@/components/organisms/EditSubscriptionDialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SubscriptionTableProps {
    subscriptions: Subscription[];
    /** Initial search query from URL */
    initialSearch?: string;
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

export function SubscriptionTable({ subscriptions, initialSearch = "" }: SubscriptionTableProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { showMonthlyCosts } = useCurrency();

    // Filter subscriptions by search query
    const filteredSubscriptions = useMemo(() => {
        if (!searchQuery.trim()) return subscriptions;
        const query = searchQuery.toLowerCase();
        return subscriptions.filter((sub) =>
            sub.service_name.toLowerCase().includes(query)
        );
    }, [subscriptions, searchQuery]);

    // Handle delete with transition
    const handleDelete = (id: string, serviceName: string) => {
        if (!confirm(`Are you sure you want to delete "${serviceName}"?`)) {
            return;
        }

        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteSubscription(id);
            if (!result.success) {
                alert(result.message);
            }
            setDeletingId(null);
        });
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground z-10" />
                <Input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 py-3 rounded-xl"
                />
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Service
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Cost
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Cycle
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Next Date
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Status
                                </th>
                                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        {searchQuery
                                            ? `No subscriptions matching "${searchQuery}"`
                                            : "No subscriptions yet. Add your first one!"}
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => {
                                    const avatarColor = getAvatarColor(sub.service_name);
                                    const isDeleting = deletingId === sub.id;

                                    return (
                                        <tr
                                            key={sub.id}
                                            className={`hover:bg-accent transition-colors ${isDeleting ? "opacity-50" : ""
                                                }`}
                                        >
                                            {/* Service */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`size-10 rounded-xl ${avatarColor.bg} ${avatarColor.border} border flex items-center justify-center ${avatarColor.text} font-bold text-sm`}
                                                    >
                                                        {sub.service_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-medium">
                                                            {sub.service_name}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {sub.category || "Other"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Cost */}
                                            <td className="px-6 py-4">
                                                <span className="text-foreground font-semibold">
                                                    {formatCurrency(
                                                        showMonthlyCosts && sub.billing_cycle === BillingCycle.YEARLY
                                                            ? sub.cost / 12
                                                            : sub.cost,
                                                        sub.currency as "USD" | "EUR" | "GBP"
                                                    )}
                                                    {showMonthlyCosts && sub.billing_cycle === BillingCycle.YEARLY && (
                                                        <span className="text-muted-foreground font-normal text-xs">/mo</span>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Cycle */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${sub.billing_cycle === BillingCycle.MONTHLY
                                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                                    }`}>
                                                    {sub.billing_cycle === BillingCycle.MONTHLY ? "Monthly" : "Yearly"}
                                                </span>
                                            </td>

                                            {/* Next Date */}
                                            <td className="px-6 py-4">
                                                <span className="text-foreground">
                                                    {sub.is_trial && sub.trial_end_date
                                                        ? format(new Date(sub.trial_end_date), "MMM d, yyyy")
                                                        : format(new Date(sub.next_billing_date), "MMM d, yyyy")}
                                                </span>
                                                {sub.is_trial && (
                                                    <span className="block text-[10px] text-blue-600 dark:text-blue-400">Trial Ends</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                {sub.is_trial ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                        Free Trial
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${sub.status === SubscriptionStatus.ACTIVE
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                        : "bg-zinc-500/10 text-muted-foreground border border-zinc-500/20"
                                                        }`}>
                                                        {sub.status === SubscriptionStatus.ACTIVE ? "Active" : "Paused"}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Edit Button */}
                                                    <EditSubscriptionDialog subscription={sub} />

                                                    {/* Delete Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(sub.id, sub.service_name)}
                                                        disabled={isPending}
                                                        className="hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                                        title="Delete subscription"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="size-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {filteredSubscriptions.length > 0 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SubscriptionTable;
