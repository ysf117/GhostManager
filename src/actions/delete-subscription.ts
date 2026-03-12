"use server";

/**
 * Server Action: Delete Subscription
 * 
 * Deletes a subscription from the database.
 * Security: Verifies the subscription belongs to the authenticated user.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface DeleteSubscriptionResult {
    success: boolean;
    message: string;
}

/**
 * Deletes a subscription by ID
 * Only allows deletion if the subscription belongs to the authenticated user
 */
export async function deleteSubscription(id: string): Promise<DeleteSubscriptionResult> {
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🗑️ DELETE SUBSCRIPTION ACTION STARTED");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("Subscription ID:", id);

    try {
        // ────────────────────────────────────────────────────────────
        // STEP 1: Get authenticated user
        // ────────────────────────────────────────────────────────────
        const supabase = await createClient();

        if (!supabase) {
            return { success: false, message: "Authentication service unavailable." };
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("❌ User not authenticated");
            return {
                success: false,
                message: "You must be logged in to delete a subscription.",
            };
        }

        console.log("✅ Authenticated user:", user.id);

        // ────────────────────────────────────────────────────────────
        // STEP 2: Verify subscription belongs to user
        // ────────────────────────────────────────────────────────────
        const subscription = await prisma.subscription.findUnique({
            where: { id },
            select: { user_id: true, service_name: true },
        });

        if (!subscription) {
            console.error("❌ Subscription not found:", id);
            return {
                success: false,
                message: "Subscription not found.",
            };
        }

        if (subscription.user_id !== user.id) {
            console.error("❌ Unauthorized: User does not own this subscription");
            return {
                success: false,
                message: "You do not have permission to delete this subscription.",
            };
        }

        console.log("✅ Verified ownership for:", subscription.service_name);

        // ────────────────────────────────────────────────────────────
        // STEP 3: Delete the subscription
        // ────────────────────────────────────────────────────────────
        await prisma.subscription.delete({
            where: { id },
        });

        console.log("✅ Subscription deleted successfully");

        // ────────────────────────────────────────────────────────────
        // STEP 4: Revalidate affected paths
        // ────────────────────────────────────────────────────────────
        revalidatePath("/dashboard");
        revalidatePath("/subscriptions");
        console.log("✅ Paths revalidated");

        console.log("\n");
        console.log("═══════════════════════════════════════════════════════════");
        console.log("✅ DELETE SUBSCRIPTION ACTION COMPLETED");
        console.log("═══════════════════════════════════════════════════════════");

        return {
            success: true,
            message: `"${subscription.service_name}" deleted successfully.`,
        };

    } catch (error) {
        console.error("❌ Delete subscription error:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
