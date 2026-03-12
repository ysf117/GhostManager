/**
 * RecentSubscriptionsList Organism
 * 
 * A list of recent subscriptions with a "View All" header.
 * Uses SubscriptionRow molecule internally.
 */

"use client";

import Link from "next/link";
import { Subscription } from "@/types/database";
import { SubscriptionRow } from "@/components/molecules/SubscriptionRow";

interface RecentSubscriptionsListProps {
    /** Array of subscriptions to display */
    subscriptions: Subscription[];
    /** Maximum number of items to display */
    maxItems?: number;
}

export function RecentSubscriptionsList({
    subscriptions,
    maxItems = 5,
}: RecentSubscriptionsListProps) {
    // Sort by next_billing_date (soonest first) and take top N
    const displayedSubscriptions = [...subscriptions]
        .sort((a, b) => {
            const dateA = a.is_trial && a.trial_end_date ? new Date(a.trial_end_date) : new Date(a.next_billing_date);
            const dateB = b.is_trial && b.trial_end_date ? new Date(b.trial_end_date) : new Date(b.next_billing_date);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(0, maxItems);

    return (
        <div className="glass-card rounded-2xl overflow-hidden border border-border">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <h3 className="text-foreground font-bold">Recent Subscriptions</h3>
                <Link
                    href="/subscriptions"
                    className="text-[#3d40f0] text-xs font-bold hover:underline transition-all"
                >
                    View All
                </Link>
            </div>

            {/* Subscription List */}
            <div className="divide-y divide-border">
                {displayedSubscriptions.length > 0 ? (
                    displayedSubscriptions.map((subscription) => (
                        <SubscriptionRow
                            key={subscription.id}
                            subscription={subscription}
                        // Row click logic can be added here later if needed
                        />
                    ))
                ) : (
                    <div className="p-6 text-center text-muted-foreground">
                        No subscriptions yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecentSubscriptionsList;
