/**
 * Settings Page
 *
 * User preferences and account settings.
 * Allows users to update their display name and default currency.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { SettingsForm } from "@/components/organisms/SettingsForm";
import { BillingCycle, Currency, Subscription, SubscriptionStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    // Get authenticated user
    const supabase = await createClient();

    if (!supabase) {
        redirect("/login");
    }

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/login");
    }

    // Fetch user data from database
    const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
            name: true,
            email: true,
            default_currency: true,
            show_monthly_costs: true,
            avatar_url: true,
            budget_limit: true,
        },
    });

    // If user doesn't exist in DB yet, create with defaults
    const userData = user ?? {
        name: null,
        email: authUser.email ?? "",
        default_currency: "USD",
        show_monthly_costs: false,
        avatar_url: null,
        budget_limit: 500,
    };

    // Fetch subscriptions for sidebar budget widget
    const dbSubscriptions = await prisma.subscription.findMany({
        where: { user_id: authUser.id },
    });
    const subscriptions: Subscription[] = dbSubscriptions.map((s) => ({
        id: s.id,
        user_id: s.user_id,
        service_name: s.service_name,
        cost: s.cost,
        currency: s.currency as Currency,
        billing_cycle: s.billing_cycle as BillingCycle,
        start_date: s.start_date,
        next_billing_date: s.next_billing_date,
        status: s.status as SubscriptionStatus,
        category: s.category,
        is_trial: s.is_trial,
        trial_end_date: s.trial_end_date,
        reminder_days: s.reminder_days,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    }));

    return (
        <DashboardLayout
            title="Settings"
            userEmail={userData.email}
            userName={userData.name}
            userAvatarUrl={userData.avatar_url}
            subscriptions={subscriptions}
            budgetLimit={userData.budget_limit}
        >
            <div className="max-w-2xl">
                <SettingsForm
                    initialName={userData.name ?? ""}
                    initialEmail={userData.email}
                    initialCurrency={userData.default_currency}
                    initialShowMonthlyCosts={userData.show_monthly_costs}
                    initialAvatarUrl={userData.avatar_url}
                    initialBudgetLimit={userData.budget_limit}
                />
            </div>
        </DashboardLayout>
    );
}
