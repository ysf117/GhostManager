/**
 * Dashboard Page
 * 
 * The main dashboard view displaying subscription spending analytics.
 * Fetches real data from Supabase via Prisma.
 */

import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { SpendChart } from "@/components/organisms/SpendChart";
import { SpendAnalysis } from "@/components/organisms/SpendAnalysis";
import { RecentSubscriptionsList } from "@/components/organisms/RecentSubscriptionsList";
import { SpendByCategory, type CategoryData } from "@/components/organisms/SpendByCategory";
import { GlassCard } from "@/components/atoms/GlassCard";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { BillingCycle, Currency, Subscription as SubscriptionType, SubscriptionStatus } from "@/types/database";

// Force dynamic rendering since we're fetching from the database
export const dynamic = "force-dynamic";

// Map Prisma result to our Subscription type
function mapToSubscription(dbSub: Awaited<ReturnType<typeof prisma.subscription.findMany>>[number]): SubscriptionType {
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

// Calculate category breakdown from subscriptions
function calculateCategoryBreakdown(subscriptions: SubscriptionType[]): CategoryData[] {
    const activeSubscriptions = subscriptions.filter((s) => s.status === SubscriptionStatus.ACTIVE);

    if (activeSubscriptions.length === 0) return [];

    // Group by Category
    const limit = 5;
    const groups: Record<string, number> = {};

    activeSubscriptions.forEach(sub => {
        // Exclude trials from category spend breakdown? Likely yes, as they are $0 currently.
        if (sub.is_trial) return;

        const name = sub.category || "Other";
        // Simple sum (ignoring currency for category breakdown specifically, as requested refactor focused on main stats)
        // In a perfect world, we'd do currency conversion here too, but we can't do client-side conversion logic on server
        const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
        groups[name] = (groups[name] || 0) + cost;
    });

    // Calculate total for percentages
    const total = Object.values(groups).reduce((sum, val) => sum + val, 0);

    const sorted = Object.entries(groups)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            color: "" // Assigned by component
        }))
        .sort((a, b) => b.amount - a.amount);

    return sorted.slice(0, limit);
}

export default async function DashboardPage() {
    // Get authenticated user
    const supabase = await createClient();

    if (!supabase) {
        redirect("/login");
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/login");
    }

    // Fetch user profile for display name and avatar
    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, avatar_url: true, budget_limit: true },
    });

    // Fetch user's subscriptions
    const dbSubscriptions = await prisma.subscription.findMany({
        where: { user_id: user.id },
        orderBy: { next_billing_date: "asc" },
    });

    // Map to our application types
    const subscriptions = dbSubscriptions.map(mapToSubscription);

    // Calculate category breakdown for the donut chart
    const categoryBreakdown = calculateCategoryBreakdown(subscriptions);

    return (
        <DashboardLayout
            title="Spend Analysis"
            userEmail={user.email}
            userName={userProfile?.name}
            userAvatarUrl={userProfile?.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userProfile?.budget_limit}
        >
            {/* Stats Cards - New Component */}
            <SpendAnalysis subscriptions={subscriptions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Main Spend Chart */}
                <GlassCard className="lg:col-span-2 p-4 md:p-6 relative overflow-hidden min-h-[350px]">
                    <SpendChart data={subscriptions} />
                </GlassCard>

                {/* Spend by Category */}
                <GlassCard className="p-4 md:p-6 relative overflow-hidden min-h-[350px] flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-base md:text-lg font-bold text-foreground">Top Categories</h3>
                        <p className="text-muted-foreground text-xs md:text-sm">
                            Spending by category
                        </p>
                    </div>

                    <SpendByCategory
                        data={categoryBreakdown}
                        className="flex-1"
                    />
                </GlassCard>
            </div>

            {/* Recent Activity */}
            <div className="mb-8">
                <RecentSubscriptionsList subscriptions={subscriptions} />
            </div>
        </DashboardLayout>
    );
}
