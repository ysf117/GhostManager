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

    console.log("📦 Raw FormData entries:", raw);

    // Parse cost as float
    if (raw.cost !== undefined && raw.cost !== null && raw.cost !== "") {
        const costString = String(raw.cost);
        const parsedCost = parseFloat(costString);
        if (isNaN(parsedCost)) {
            console.error("❌ Failed to parse cost:", raw.cost);
        } else {
            raw.cost = parsedCost;
            console.log("💰 Parsed cost:", parsedCost);
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
        console.log("📅 Trial detected with no start date. Defaulting start_date to NOW.");
        raw.start_date = new Date().toISOString();
    }

    return raw;
}

/**
 * Calculates the next billing date based on start date and billing cycle.
 * If the calculated date is in the past, advances to the next cycle.
 */
function calculateNextBillingDate(
    startDate: Date,
    billingCycle: "MONTHLY" | "YEARLY"
): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // If start date is in the future, that's the next billing date
    if (start > today) {
        console.log("📅 Start date is in future, using as next billing date:", start);
        return start;
    }

    // Calculate how many billing periods have passed
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / msPerDay);
    const cycleInDays = billingCycle === "YEARLY" ? 365 : 30;
    const cyclesPassed = Math.floor(daysSinceStart / cycleInDays);

    // Next billing date is the start date plus (cycles passed + 1) billing periods
    const nextDate = new Date(start);
    if (billingCycle === "YEARLY") {
        nextDate.setFullYear(nextDate.getFullYear() + cyclesPassed + 1);
    } else {
        nextDate.setMonth(nextDate.getMonth() + cyclesPassed + 1);
    }

    console.log("📅 Calculated next billing date:", nextDate);
    return nextDate;
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
    console.log("\n");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🚀 CREATE SUBSCRIPTION ACTION STARTED");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("⏰ Timestamp:", new Date().toISOString());

    try {
        // ────────────────────────────────────────────────────────────
        // STEP 1: Parse the input data
        // ────────────────────────────────────────────────────────────
        console.log("\n📋 STEP 1: Parsing input data...");

        let dataToValidate: Record<string, unknown>;

        if (formData instanceof FormData) {
            console.log("   Input type: FormData");
            dataToValidate = parseFormData(formData);
        } else {
            console.log("   Input type: Object");
            console.log("   Raw object:", JSON.stringify(formData, null, 2));
            dataToValidate = formData as Record<string, unknown>;
        }

        // ────────────────────────────────────────────────────────────
        // STEP 2: Validate the data with Zod
        // ────────────────────────────────────────────────────────────
        console.log("\n✅ STEP 2: Validating data with Zod schema...");

        const validationResult = CreateSubscriptionSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            const errors: Record<string, string> = {};
            validationResult.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                errors[path] = issue.message;
                console.error(`   ❌ Validation error on "${path}": ${issue.message}`);
            });

            console.log("\n🛑 VALIDATION FAILED");
            console.log("   Errors:", JSON.stringify(errors, null, 2));

            return {
                success: false,
                message: "Validation failed. Please check your input.",
                errors,
            };
        }

        const validatedData = validationResult.data;
        console.log("   ✅ Validation passed!");
        console.log("   Validated data:", JSON.stringify(validatedData, null, 2));

        // ────────────────────────────────────────────────────────────
        // STEP 3: Get authenticated user from Supabase
        // ────────────────────────────────────────────────────────────
        console.log("\n👤 STEP 3: Getting authenticated user...");

        const supabase = await createClient();

        if (!supabase) {
            return { success: false, message: "Authentication service unavailable." };
        }

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            console.error("   ❌ USER NOT AUTHENTICATED!");
            return {
                success: false,
                message: "You must be logged in to create a subscription.",
            };
        }

        console.log("   ✅ Authenticated user:", authUser.id);
        console.log("   User email:", authUser.email);

        // ────────────────────────────────────────────────────────────
        // STEP 3b: Lazy Sync - Ensure user exists in local database
        // ────────────────────────────────────────────────────────────
        console.log("\n🔄 STEP 3b: Syncing user to local database (upsert)...");

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

        console.log("   ✅ User synced:", user.id);
        console.log("   User name:", user.name);

        // ────────────────────────────────────────────────────────────
        // STEP 4: Calculate next billing date if not provided
        // ────────────────────────────────────────────────────────────
        console.log("\n📅 STEP 4: Determining next billing date...");

        const nextBillingDate =
            validatedData.next_billing_date ??
            calculateNextBillingDate(validatedData.start_date, validatedData.billing_cycle);

        console.log("   Next billing date:", nextBillingDate.toISOString());

        // ────────────────────────────────────────────────────────────
        // STEP 5: Create the subscription in the database
        // ────────────────────────────────────────────────────────────
        console.log("\n💾 STEP 5: Creating subscription in database...");

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

        console.log("   Data to insert:", JSON.stringify(subscriptionData, null, 2));

        const subscription = await prisma.subscription.create({
            data: subscriptionData,
        });

        console.log("   ✅ Subscription created successfully!");
        console.log("   Subscription ID:", subscription.id);

        // ────────────────────────────────────────────────────────────
        // STEP 6: Revalidate the dashboard
        // ────────────────────────────────────────────────────────────
        console.log("\n🔄 STEP 6: Revalidating dashboard...");
        revalidatePath("/dashboard");
        console.log("   ✅ Dashboard revalidated!");

        // ────────────────────────────────────────────────────────────
        // SUCCESS!
        // ────────────────────────────────────────────────────────────
        console.log("\n");
        console.log("═══════════════════════════════════════════════════════════");
        console.log("✅ CREATE SUBSCRIPTION ACTION COMPLETED SUCCESSFULLY");
        console.log("═══════════════════════════════════════════════════════════");
        console.log("\n");

        return {
            success: true,
            message: `Subscription "${subscription.service_name}" created successfully!`,
            subscriptionId: subscription.id,
        };

    } catch (error) {
        // ────────────────────────────────────────────────────────────
        // ERROR HANDLING
        // ────────────────────────────────────────────────────────────
        console.log("\n");
        console.log("═══════════════════════════════════════════════════════════");
        console.error("❌ CREATE SUBSCRIPTION ACTION FAILED");
        console.log("═══════════════════════════════════════════════════════════");

        if (error instanceof Error) {
            console.error("   Error name:", error.name);
            console.error("   Error message:", error.message);
            console.error("   Stack trace:", error.stack);

            // Check for Prisma-specific errors
            if (error.message.includes("Foreign key constraint")) {
                console.error("   💡 This is a foreign key error. Check that user_id is valid.");
            }
            if (error.message.includes("Unique constraint")) {
                console.error("   💡 This is a unique constraint error. A similar record may exist.");
            }

            return {
                success: false,
                message: `Database Error: ${error.message}`,
            };
        }

        console.error("   Unknown error type:", error);

        return {
            success: false,
            message: "An unexpected error occurred. Check server logs for details.",
        };
    }
}
