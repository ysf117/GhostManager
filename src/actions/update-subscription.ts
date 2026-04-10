"use server";

/**
 * Server Action: Update Subscription
 * 
 * Updates an existing subscription in the database.
 * Security: Verifies the subscription belongs to the authenticated user.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { calculateNextBillingDate } from "@/lib/utils/date-calculator";
import { BillingCycle } from "@/types/database";

const isDev = process.env.NODE_ENV !== "production";
function debug(...args: unknown[]) { if (isDev) console.log(...args); }
function debugError(...args: unknown[]) { if (isDev) console.error(...args); }

// ============================================
// VALIDATION SCHEMA
// ============================================

const UpdateSubscriptionSchema = z.object({
    id: z.string().min(1, "Subscription ID is required"),
    service_name: z
        .string()
        .min(1, "Service name is required")
        .max(100, "Service name must be 100 characters or less"),
    cost: z
        .number()
        .positive("Cost must be a positive number"),
    currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
    billing_cycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
    start_date: z.coerce.date(),
    next_billing_date: z.coerce.date().optional(),
    status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE"),
    category: z.string().default("Other"),
    is_trial: z.boolean().default(false),
    trial_end_date: z.coerce.date().optional().nullable(),
    reminder_days: z.number().int().optional().nullable(),
});

// ============================================
// RESULT TYPE
// ============================================

export interface UpdateSubscriptionResult {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseFormData(formData: FormData): Record<string, unknown> {
    const raw: Record<string, unknown> = {};

    formData.forEach((value, key) => {
        raw[key] = value;
    });

    // Parse cost as float
    if (raw.cost !== undefined && raw.cost !== null && raw.cost !== "") {
        const parsedCost = parseFloat(String(raw.cost));
        if (!isNaN(parsedCost)) {
            raw.cost = parsedCost;
        }
    }

    // Parse dates
    if (raw.start_date && typeof raw.start_date === "string") {
        raw.start_date = new Date(raw.start_date);
    }
    if (raw.next_billing_date && typeof raw.next_billing_date === "string") {
        raw.next_billing_date = new Date(raw.next_billing_date);
    }

    // Parse booleans
    if (raw.is_trial === "true" || raw.is_trial === "on") {
        raw.is_trial = true;
    } else if (raw.is_trial === "false") {
        raw.is_trial = false;
    }

    // Parse integers
    if (raw.reminder_days && typeof raw.reminder_days === "string" && raw.reminder_days !== "null") {
        const num = parseInt(raw.reminder_days, 10);
        if (!isNaN(num)) {
            raw.reminder_days = num;
        } else {
            raw.reminder_days = null;
        }
    } else if (raw.reminder_days === "null" || raw.reminder_days === "") {
        raw.reminder_days = null;
    }

    return raw;
}

// ============================================
// MAIN ACTION
// ============================================

export async function updateSubscription(
    formData: FormData
): Promise<UpdateSubscriptionResult> {
    debug("\n");
    debug("═══════════════════════════════════════════════════════════");
    debug("✏️ UPDATE SUBSCRIPTION ACTION STARTED");
    debug("═══════════════════════════════════════════════════════════");

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
                message: "You must be logged in to update a subscription.",
            };
        }

        debug("✅ Authenticated user:", user.id);

        // ────────────────────────────────────────────────────────────
        // STEP 2: Parse and validate form data
        // ────────────────────────────────────────────────────────────
        const rawData = parseFormData(formData);
        debug("📦 Parsed form data:", rawData);

        const validationResult = UpdateSubscriptionSchema.safeParse(rawData);

        if (!validationResult.success) {
            const errors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                errors[path] = issue.message;
            });

            debugError("❌ Validation failed:", errors);
            return {
                success: false,
                message: "Validation failed. Please check your inputs.",
                errors,
            };
        }

        const data = validationResult.data;
        debug("✅ Validated data:", data);

        // ────────────────────────────────────────────────────────────
        // STEP 3: Verify subscription belongs to user
        // ────────────────────────────────────────────────────────────
        const existingSubscription = await prisma.subscription.findUnique({
            where: { id: data.id },
            select: { user_id: true, service_name: true },
        });

        if (!existingSubscription) {
            debugError("❌ Subscription not found:", data.id);
            return {
                success: false,
                message: "Subscription not found.",
            };
        }

        if (existingSubscription.user_id !== user.id) {
            debugError("❌ Unauthorized: User does not own this subscription");
            return {
                success: false,
                message: "You do not have permission to update this subscription.",
            };
        }

        debug("✅ Verified ownership for:", existingSubscription.service_name);

        // ────────────────────────────────────────────────────────────
        // STEP 4: Calculate next billing date if not provided
        // ────────────────────────────────────────────────────────────
        const nextBillingDate =
            data.next_billing_date ??
            calculateNextBillingDate(data.start_date, data.billing_cycle as BillingCycle);

        // ────────────────────────────────────────────────────────────
        // STEP 5: Update subscription
        // ────────────────────────────────────────────────────────────
        const updated = await prisma.subscription.update({
            where: {
                id: data.id,
                user_id: user.id, // Extra safety check
            },
            data: {
                service_name: data.service_name,
                cost: data.cost,
                currency: data.currency,
                billing_cycle: data.billing_cycle,
                start_date: data.start_date,
                next_billing_date: nextBillingDate,
                status: data.status,
                category: data.category,
                is_trial: data.is_trial,
                trial_end_date: data.trial_end_date,
                reminder_days: data.reminder_days,
            },
        });

        debug("✅ Subscription updated:", updated.id);

        // ────────────────────────────────────────────────────────────
        // STEP 6: Revalidate paths
        // ────────────────────────────────────────────────────────────
        revalidatePath("/dashboard");
        revalidatePath("/subscriptions");
        debug("✅ Paths revalidated");

        debug("\n");
        debug("═══════════════════════════════════════════════════════════");
        debug("✅ UPDATE SUBSCRIPTION ACTION COMPLETED");
        debug("═══════════════════════════════════════════════════════════");

        return {
            success: true,
            message: `"${data.service_name}" updated successfully.`,
        };

    } catch (error) {
        debugError("❌ Update subscription error:", error);

        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}
