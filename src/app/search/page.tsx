/**
 * Global Search Results Page
 *
 * Displays search results across subscriptions, upcoming payments, and reports.
 * Filters real subscription data server-side based on the ?q= query param.
 */

import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { GlassCard } from "@/components/atoms/GlassCard";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
    BillingCycle,
    Currency,
    Subscription,
    SubscriptionStatus,
} from "@/types/database";

export const dynamic = "force-dynamic";

function mapToSubscription(
    dbSub: Awaited<ReturnType<typeof prisma.subscription.findMany>>[number],
): Subscription {
    return {
        id: dbSub.id,
        user_id: dbSub.user_id,
        service_name: dbSub.service_name,
        cost: dbSub.cost,
        currency: dbSub.currency as Currency,
        billing_cycle: dbSub.billing_cycle as BillingCycle,
        start_date: dbSub.start_date,
        next_billing_date: dbSub.next_billing_date,
        status: dbSub.status as SubscriptionStatus,
        category: dbSub.category,
        is_trial: dbSub.is_trial,
        trial_end_date: dbSub.trial_end_date,
        reminder_days: dbSub.reminder_days,
        createdAt: dbSub.createdAt,
        updatedAt: dbSub.updatedAt,
    };
}

function searchSubscriptions(subs: Subscription[], query: string): Subscription[] {
    const q = query.toLowerCase();
    return subs.filter(
        (s) =>
            s.service_name.toLowerCase().includes(q) ||
            (s.category && s.category.toLowerCase().includes(q)),
    );
}

function getUpcomingPayments(subs: Subscription[], query: string): Subscription[] {
    const q = query.toLowerCase();
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return subs.filter((s) => {
        const matchesQuery =
            s.service_name.toLowerCase().includes(q) ||
            (s.category && s.category.toLowerCase().includes(q));
        const nextDate = new Date(s.next_billing_date);
        const isUpcoming = nextDate >= now && nextDate <= thirtyDays;
        return matchesQuery && isUpcoming && s.status === SubscriptionStatus.ACTIVE;
    });
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";

    const supabase = await createClient();

    if (!supabase) {
        redirect("/login");
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, avatar_url: true, budget_limit: true },
    });

    const dbSubscriptions = await prisma.subscription.findMany({
        where: { user_id: user.id },
        orderBy: { next_billing_date: "asc" },
    });

    const subscriptions = dbSubscriptions.map(mapToSubscription);

    const matchedSubs = query ? searchSubscriptions(subscriptions, query) : [];
    const upcomingPayments = query ? getUpcomingPayments(subscriptions, query) : [];

    const hasResults = matchedSubs.length > 0 || upcomingPayments.length > 0;

    return (
        <DashboardLayout
            title="Search"
            userEmail={user.email}
            userName={userProfile?.name}
            userAvatarUrl={userProfile?.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userProfile?.budget_limit}
        >
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">
                    {query ? (
                        <>
                            Results for &ldquo;<span className="text-purple-400">{query}</span>&rdquo;
                        </>
                    ) : (
                        "Search"
                    )}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    {hasResults
                        ? `Found ${matchedSubs.length} subscription${matchedSubs.length !== 1 ? "s" : ""} and ${upcomingPayments.length} upcoming payment${upcomingPayments.length !== 1 ? "s" : ""}`
                        : query
                            ? "No results found. Try a different search term."
                            : "Enter a search term to find subscriptions and payments."}
                </p>
            </div>

            {/* Results */}
            {hasResults ? (
                <div className="space-y-6">
                    {/* Subscriptions */}
                    {matchedSubs.length > 0 && (
                        <GlassCard className="p-4 md:p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                <span className="material-symbols-outlined text-purple-400 align-middle mr-2">subscriptions</span>
                                Subscriptions
                            </h2>
                            <div className="space-y-3">
                                {matchedSubs.map((sub) => (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-purple-400">
                                                    credit_card
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {sub.service_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {sub.category || "Uncategorized"} &middot;{" "}
                                                    {sub.billing_cycle === BillingCycle.YEARLY ? "Yearly" : "Monthly"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-foreground">
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: sub.currency,
                                                }).format(sub.cost)}
                                            </p>
                                            <span
                                                className={`text-xs font-semibold ${
                                                    sub.status === SubscriptionStatus.ACTIVE
                                                        ? "text-emerald-400"
                                                        : "text-amber-400"
                                                }`}
                                            >
                                                {sub.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Upcoming Payments */}
                    {upcomingPayments.length > 0 && (
                        <GlassCard className="p-4 md:p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">
                                <span className="material-symbols-outlined text-cyan-400 align-middle mr-2">account_balance_wallet</span>
                                Upcoming Payments
                            </h2>
                            <div className="space-y-3">
                                {upcomingPayments.map((sub) => (
                                    <div
                                        key={`payment-${sub.id}`}
                                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-cyan-400">
                                                    calendar_today
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {sub.service_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Due{" "}
                                                    {new Date(sub.next_billing_date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-foreground shrink-0">
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: sub.currency,
                                            }).format(sub.cost)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>
            ) : query ? (
                /* Empty State */
                <GlassCard className="p-8 md:p-12 flex flex-col items-center justify-center text-center">
                    <span className="material-symbols-outlined text-5xl text-muted-foreground/30 mb-4">
                        search_off
                    </span>
                    <h2 className="text-lg font-bold text-foreground mb-2">No results found</h2>
                    <p className="text-sm text-muted-foreground max-w-md">
                        We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                        Try searching for a subscription name or category.
                    </p>
                </GlassCard>
            ) : null}
        </DashboardLayout>
    );
}
