/**
 * Reports Page
 *
 * Displays financial reports and spending analytics:
 * - Top Spenders horizontal bar chart
 * - Category Breakdown table
 * - Yearly Projection card
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { TopSpendersChart } from "@/components/organisms/TopSpendersChart";
import { CategoryBreakdownTable } from "@/components/organisms/CategoryBreakdownTable";
import { YearlyProjectionCard } from "@/components/organisms/YearlyProjectionCard";
import { BillingCycle, Currency, Subscription, SubscriptionStatus } from "@/types/database";

export const dynamic = "force-dynamic";

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

export default async function ReportsPage() {
    const supabase = await createClient();

    if (!supabase) {
        redirect("/login");
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, avatar_url: true, budget_limit: true },
    });

    const dbSubscriptions = await prisma.subscription.findMany({
        where: { user_id: user.id },
        orderBy: { cost: "desc" },
    });
    const subscriptions = dbSubscriptions.map(mapToSubscription);

    return (
        <DashboardLayout
            title="Reports"
            userEmail={user.email}
            userName={userProfile?.name}
            userAvatarUrl={userProfile?.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userProfile?.budget_limit}
        >
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Analyze your subscription spending habits
                </p>
            </div>

            {/* Yearly Projection */}
            <div className="mb-8">
                <YearlyProjectionCard subscriptions={subscriptions} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Spenders */}
                <div className="glass-card p-6 rounded-2xl border border-border">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-foreground">Top Spenders</h3>
                        <p className="text-muted-foreground text-sm">
                            Your 5 most expensive subscriptions (monthly cost)
                        </p>
                    </div>
                    <TopSpendersChart subscriptions={subscriptions} />
                </div>

                {/* Category Breakdown */}
                <div className="glass-card p-6 rounded-2xl border border-border">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-foreground">Category Breakdown</h3>
                        <p className="text-muted-foreground text-sm">
                            Monthly spend by category
                        </p>
                    </div>
                    <CategoryBreakdownTable subscriptions={subscriptions} />
                </div>
            </div>
        </DashboardLayout>
    );
}
