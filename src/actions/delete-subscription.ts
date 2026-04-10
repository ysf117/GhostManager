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

const isDev = process.env.NODE_ENV !== "production";
function debug(...args: unknown[]) { if (isDev) console.log(...args); }
function debugError(...args: unknown[]) { if (isDev) console.error(...args); }

export interface DeleteSubscriptionResult {
    success: boolean;
    message: string;
}

/**
 * Deletes a subscription by ID
 * Only allows deletion if the subscription belongs to the authenticated user
 */
export async function deleteSubscription(id: string): Promise<DeleteSubscriptionResult> {
    debug("\n");
    debug("═══════════════════════════════════════════════════════════");
    debug("🗑️ DELETE SUBSCRIPTION ACTION STARTED");
    debug("═══════════════════════════════════════════════════════════");
    debug("Subscription ID:", id);

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
            debugError("❌ User not authenticated");
            return {
                success: false,
                message: "You must be logged in to delete a subscription.",
            };
        }

        debug("✅ Authenticated user:", user.id);

        // ────────────────────────────────────────────────────────────
        // STEP 2: Verify subscription belongs to user
        // ────────────────────────────────────────────────────────────
        const subscription = await prisma.subscription.findUnique({
            where: { id },
            select: { user_id: true, service_name: true },
        });

        if (!subscription) {
            debugError("❌ Subscription not found:", id);
            return {
                success: false,
                message: "Subscription not found.",
            };
        }

        if (subscription.user_id !== user.id) {
            debugError("❌ Unauthorized: User does not own this subscription");
            return {
                success: false,
                message: "You do not have permission to delete this subscription.",
            };
        }

        debug("✅ Verified ownership for:", subscription.service_name);

        // ────────────────────────────────────────────────────────────
        // STEP 3: Delete the subscription
        // ────────────────────────────────────────────────────────────
        await prisma.subscription.delete({
            where: { id },
        });

        debug("✅ Subscription deleted successfully");

        // ────────────────────────────────────────────────────────────
        // STEP 4: Revalidate affected paths
        // ────────────────────────────────────────────────────────────
        revalidatePath("/dashboard");
        revalidatePath("/subscriptions");
        debug("✅ Paths revalidated");

        debug("\n");
        debug("═══════════════════════════════════════════════════════════");
        debug("✅ DELETE SUBSCRIPTION ACTION COMPLETED");
        debug("═══════════════════════════════════════════════════════════");

        return {
            success: true,
            message: `"${subscription.service_name}" deleted successfully.`,
        };

    } catch (error) {
        debugError("❌ Delete subscription error:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
