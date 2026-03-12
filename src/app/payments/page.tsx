/**
 * Payments Page
 *
 * Displays projected payment history based on subscription data.
 * Since individual transactions are not stored, payments are generated
 * from each subscription's start_date and billing_cycle.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { PaymentHistoryTable } from "@/components/organisms/PaymentHistoryTable";
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

export default async function PaymentsPage() {
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
    });
    const subscriptions = dbSubscriptions.map(mapToSubscription);

    return (
        <DashboardLayout
            title="Payments"
            userEmail={user.email}
            userName={userProfile?.name}
            userAvatarUrl={userProfile?.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userProfile?.budget_limit}
        >
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Projected payment history based on your subscriptions
                </p>
            </div>

            {/* Payment History Table */}
            <PaymentHistoryTable subscriptions={subscriptions} />
        </DashboardLayout>
    );
}
