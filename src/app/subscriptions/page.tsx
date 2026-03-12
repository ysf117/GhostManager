/**
 * Subscriptions Page
 * 
 * Full subscriptions management page with:
 * - Data table with all subscriptions
 * - Search and filter capabilities
 * - Delete functionality
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { SubscriptionTable } from "@/components/organisms/SubscriptionTable";
import { BillingCycle, Currency, Subscription, SubscriptionStatus } from "@/types/database";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Map Prisma result to our Subscription type
function mapToSubscription(dbSub: Awaited<ReturnType<typeof prisma.subscription.findMany>>[number]): Subscription {
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

export default async function SubscriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    // Get search query from URL
    const params = await searchParams;
    const initialSearch = params.search || "";

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

    // Map to application types
    const subscriptions = dbSubscriptions.map(mapToSubscription);

    // Calculate summary stats
    const activeCount = subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length;
    const totalMonthly = subscriptions
        .filter(s => s.status === SubscriptionStatus.ACTIVE)
        .reduce((total, sub) => {
            if (sub.is_trial) return total; // Exclude trials
            const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
            return total + cost;
        }, 0);

    // Detect primary currency
    const primaryCurrency = subscriptions.length > 0
        ? subscriptions[0].currency
        : "USD";

    return (
        <DashboardLayout
            title="Subscriptions"
            userEmail={user.email}
            userName={userProfile?.name}
            userAvatarUrl={userProfile?.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userProfile?.budget_limit}
        >
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">All Subscriptions</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage all your active subscriptions
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Total Subscriptions</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{subscriptions.length}</p>
                </div>
                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{activeCount}</p>
                </div>
                <div className="stat-card">
                    <p className="text-muted-foreground text-sm font-medium">Monthly Total</p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: primaryCurrency,
                        }).format(totalMonthly)}
                    </p>
                </div>
            </div>

            {/* Subscription Table */}
            <SubscriptionTable subscriptions={subscriptions} initialSearch={initialSearch} />
        </DashboardLayout>
    );
}
