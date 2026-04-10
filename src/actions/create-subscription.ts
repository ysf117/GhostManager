"use server";

/**
 * Server Action: Create Subscription
 * 
 * Creates a new subscription in the database.
 * Bulletproof version with comprehensive logging and error handling.
 * 
 * @version 2.0.0 - Added verbose logging, robust error handling, and user validation
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

/**
 * Zod schema for validating subscription input.
 * All fields are validated with appropriate constraints.
 */
const CreateSubscriptionSchema = z.object({
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
    icon_key: z.string().optional().nullable(),
    // New Fields
    category: z.string().default("Other"),
    is_trial: z.boolean().default(false),
    trial_end_date: z.coerce.date().optional().nullable(),
    reminder_days: z.number().int().optional().nullable(),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

// ============================================
// RESULT TYPES
// ============================================

export interface CreateSubscriptionResult {
    success: boolean;
    message: string;
    subscriptionId?: string;
    errors?: Record<string, string>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parses raw FormData into a structured object for validation.
 * Handles type coercion for numeric and date fields.
 */
function parseFormData(formData: FormData): Record<string, unknown> {
    const raw: Record<string, unknown> = {};

    // Extract all form fields
    formData.forEach((value, key) => {
        raw[key] = value;
    });

    debug("📦 Raw FormData entries:", raw);

    // Parse cost as float
    if (raw.cost !== undefined && raw.cost !== null && raw.cost !== "") {
        const costString = String(raw.cost);
        const parsedCost = parseFloat(costString);
        if (isNaN(parsedCost)) {
            debugError("❌ Failed to parse cost:", raw.cost);
        } else {
            raw.cost = parsedCost;
            debug("💰 Parsed cost:", parsedCost);
        }
    }

    // Parse booleans
    if (raw.is_trial === "true" || raw.is_trial === "on") {
        raw.is_trial = true;
    } else {
        raw.is_trial = false;
    }

    // Parse integers (reminder_days)
    if (raw.reminder_days && typeof raw.reminder_days === "string" && raw.reminder_days !== "null") {
        const num = parseInt(raw.reminder_days, 10);
        if (!isNaN(num)) {
            raw.reminder_days = num;
        } else {
            raw.reminder_days = null;
        }
    } else if (raw.reminder_days === "null" || raw.reminder_days === "") {
        raw.reminder_days = null; // Explicitly null
    }

    // Parse dates
    // Zod's coerce.date() handles strings automatically, but if we need manual:
    // We leave strict parsing to Zod usually, just ensure it's not null string.

    // START DATE TRIAL FIX:
    // If it's a trial and no start date is provided, default to NOW.
    if (raw.is_trial === true && (!raw.start_date || raw.start_date === "")) {
        debug("📅 Trial detected with no start date. Defaulting start_date to NOW.");
        raw.start_date = new Date().toISOString();
    }

    return raw;
}


// ============================================
// MAIN ACTION
// ============================================

/**
 * Creates a new subscription in the database.
 * 
 * This action:
 * 1. Parses and validates the form data
 * 2. Fetches the demo user (required for foreign key)
 * 3. Calculates the next billing date if not provided
 * 4. Creates the subscription in the database
 * 5. Revalidates the dashboard to show the new subscription
 * 
 * @param formData - Either FormData from a form submission or a structured object
 * @returns Result object with success status, message, and optional subscription ID
 */
export async function createSubscription(
    formData: FormData | CreateSubscriptionInput
): Promise<CreateSubscriptionResult> {
    debug("\n");
    debug("═══════════════════════════════════════════════════════════");
    debug("🚀 CREATE SUBSCRIPTION ACTION STARTED");
    debug("═══════════════════════════════════════════════════════════");
    debug("⏰ Timestamp:", new Date().toISOString());

    try {
        // ────────────────────────────────────────────────────────────
        // STEP 1: Parse the input data
        // ────────────────────────────────────────────────────────────
        debug("\n📋 STEP 1: Parsing input data...");

        let dataToValidate: Record<string, unknown>;

        if (formData instanceof FormData) {
            debug("   Input type: FormData");
            dataToValidate = parseFormData(formData);
        } else {
            debug("   Input type: Object");
            debug("   Raw object:", JSON.stringify(formData, null, 2));
            dataToValidate = formData as Record<string, unknown>;
        }

        // ────────────────────────────────────────────────────────────
        // STEP 2: Validate the data with Zod
        // ────────────────────────────────────────────────────────────
        debug("\n✅ STEP 2: Validating data with Zod schema...");

        const validationResult = CreateSubscriptionSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            const errors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                errors[path] = issue.message;
                debugError(`   ❌ Validation error on "${path}": ${issue.message}`);
            });

            debug("\n🛑 VALIDATION FAILED");
            debug("   Errors:", JSON.stringify(errors, null, 2));

            return {
                success: false,
                message: "Validation failed. Please check your input.",
                errors,
            };
        }

        const validatedData = validationResult.data;
        debug("   ✅ Validation passed!");
        debug("   Validated data:", JSON.stringify(validatedData, null, 2));

        // ────────────────────────────────────────────────────────────
        // STEP 3: Get authenticated user from Supabase
        // ────────────────────────────────────────────────────────────
        debug("\n👤 STEP 3: Getting authenticated user...");

        const supabase = await createClient();

        if (!supabase) {
            return { success: false, message: "Authentication service unavailable." };
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            debugError("   ❌ USER NOT AUTHENTICATED!");
            return {
                success: false,
                message: "You must be logged in to create a subscription.",
            };
        }

        debug("   ✅ Authenticated user:", authUser.id);
        debug("   User email:", authUser.email);

        // ────────────────────────────────────────────────────────────
        // STEP 3b: Lazy Sync - Ensure user exists in local database
        // ────────────────────────────────────────────────────────────
        debug("\n🔄 STEP 3b: Syncing user to local database (upsert)...");

        const user = await prisma.user.upsert({
            where: { id: authUser.id },
            update: {
                // Update email if it changed
                email: authUser.email ?? "",
            },
            create: {
                id: authUser.id,
                email: authUser.email ?? "",
                name: authUser.user_metadata?.full_name ?? "New User",
                avatar_url: authUser.user_metadata?.avatar_url ?? "",
            },
        });

        debug("   ✅ User synced:", user.id);
        debug("   User name:", user.name);

        // ────────────────────────────────────────────────────────────
        // STEP 4: Calculate next billing date if not provided
        // ────────────────────────────────────────────────────────────
        debug("\n📅 STEP 4: Determining next billing date...");

        const nextBillingDate =
            validatedData.next_billing_date ??
            calculateNextBillingDate(validatedData.start_date, validatedData.billing_cycle as BillingCycle);

        debug("   Next billing date:", nextBillingDate.toISOString());

        // ────────────────────────────────────────────────────────────
        // STEP 5: Create the subscription in the database
        // ────────────────────────────────────────────────────────────
        debug("\n💾 STEP 5: Creating subscription in database...");

        const subscriptionData = {
            user_id: user.id, // CRITICAL: Foreign key to user
            service_name: validatedData.service_name,
            cost: validatedData.cost,
            currency: validatedData.currency,
            billing_cycle: validatedData.billing_cycle,
            start_date: validatedData.start_date,
            next_billing_date: nextBillingDate,
            status: validatedData.status,
            icon_key: validatedData.icon_key ?? null,
            // New Fields
            category: validatedData.category,
            is_trial: validatedData.is_trial,
            trial_end_date: validatedData.trial_end_date,
            reminder_days: validatedData.reminder_days,
        };

        debug("   Data to insert:", JSON.stringify(subscriptionData, null, 2));

        const subscription = await prisma.subscription.create({
            data: subscriptionData,
        });

        debug("   ✅ Subscription created successfully!");
        debug("   Subscription ID:", subscription.id);

        // ────────────────────────────────────────────────────────────
        // STEP 6: Revalidate the dashboard
        // ────────────────────────────────────────────────────────────
        debug("\n🔄 STEP 6: Revalidating dashboard...");
        revalidatePath("/dashboard");
        debug("   ✅ Dashboard revalidated!");

        // ────────────────────────────────────────────────────────────
        // SUCCESS!
        // ────────────────────────────────────────────────────────────
        debug("\n");
        debug("═══════════════════════════════════════════════════════════");
        debug("✅ CREATE SUBSCRIPTION ACTION COMPLETED SUCCESSFULLY");
        debug("═══════════════════════════════════════════════════════════");
        debug("\n");

        return {
            success: true,
            message: `Subscription "${subscription.service_name}" created successfully!`,
            subscriptionId: subscription.id,
        };

    } catch (error) {
        // ────────────────────────────────────────────────────────────
        // ERROR HANDLING
        // ────────────────────────────────────────────────────────────
        debug("\n");
        debug("═══════════════════════════════════════════════════════════");
        debugError("❌ CREATE SUBSCRIPTION ACTION FAILED");
        debug("═══════════════════════════════════════════════════════════");

        if (error instanceof Error) {
            debugError("   Error name:", error.name);
            debugError("   Error message:", error.message);
            debugError("   Stack trace:", error.stack);

            // Check for Prisma-specific errors
            if (error.message.includes("Foreign key constraint")) {
                debugError("   💡 This is a foreign key error. Check that user_id is valid.");
            }
            if (error.message.includes("Unique constraint")) {
                debugError("   💡 This is a unique constraint error. A similar record may exist.");
            }

            return {
                success: false,
                message: `Database Error: ${error.message}`,
            };
        }

        debugError("   Unknown error type:", error);

        return {
            success: false,
            message: "An unexpected error occurred. Check server logs for details.",
        };
    }
}
