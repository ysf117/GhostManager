"use server";

/**
 * Server Action: Update User Settings
 *
 * Updates user profile settings (name, default currency).
 * Uses the (prevState, formData) signature for useActionState compatibility.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type SettingsResult = {
    success: boolean;
    message: string;
};

const VALID_CURRENCIES = ["USD", "EUR", "GBP"];

/**
 * Update user settings (name and default currency)
 */
export async function updateSettings(
    prevState: SettingsResult,
    formData: FormData
): Promise<SettingsResult> {
    const name = formData.get("name") as string;
    const defaultCurrency = formData.get("default_currency") as string;
    const showMonthlyCosts = formData.get("show_monthly_costs") === "true";
    const budgetLimitRaw = formData.get("budget_limit") as string;
    const budgetLimit = budgetLimitRaw ? parseFloat(budgetLimitRaw) : 500;

    // Validate currency
    if (!VALID_CURRENCIES.includes(defaultCurrency)) {
        return {
            success: false,
            message: "Invalid currency selected",
        };
    }

    // Validate budget limit
    if (isNaN(budgetLimit) || budgetLimit < 0) {
        return {
            success: false,
            message: "Budget limit must be a positive number",
        };
    }

    // Get authenticated user
    const supabase = await createClient();

    if (!supabase) {
        return { success: false, message: "Authentication service unavailable" };
    }

    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
        return {
            success: false,
            message: "You must be logged in to update settings",
        };
    }

    try {
        // Update user in database
        await prisma.user.update({
            where: { id: authUser.id },
            data: {
                name: name || null,
                default_currency: defaultCurrency,
                show_monthly_costs: showMonthlyCosts,
                budget_limit: budgetLimit,
            },
        });

        // Revalidate layout to reflect changes across the app
        revalidatePath("/", "layout");

        return {
            success: true,
            message: "Settings updated successfully",
        };
    } catch (error) {
        console.error("[Settings] Update error:", error);
        return {
            success: false,
            message: "Failed to update settings. Please try again.",
        };
    }
}
