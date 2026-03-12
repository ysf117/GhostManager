import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function daysFromNow(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

function dayOfMonth(day: number): Date {
    const d = new Date();
    d.setDate(day);
    // If that day already passed this month, move to next month
    if (d < new Date()) {
        d.setMonth(d.getMonth() + 1);
    }
    return d;
}

const SUBSCRIPTIONS = [
    {
        service_name: "Netflix Premium",
        cost: 22.99,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Entertainment",
        start_date: new Date("2023-03-15"),
        next_billing_date: daysFromNow(5),
        icon_key: "netflix",
    },
    {
        service_name: "Spotify Duo",
        cost: 14.99,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Entertainment",
        start_date: new Date("2023-06-01"),
        next_billing_date: daysFromNow(12),
        icon_key: "spotify",
    },
    {
        service_name: "Gold's Gym",
        cost: 45.0,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Health",
        start_date: new Date("2024-01-10"),
        next_billing_date: dayOfMonth(1),
        icon_key: "gym",
    },
    {
        service_name: "ChatGPT Plus",
        cost: 20.0,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Software",
        start_date: new Date("2024-02-20"),
        next_billing_date: daysFromNow(-2),
        icon_key: "openai",
    },
    {
        service_name: "AWS",
        cost: 12.45,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Infrastructure",
        start_date: new Date("2023-09-01"),
        next_billing_date: dayOfMonth(28),
        icon_key: "aws",
    },
    {
        service_name: "HelloFresh",
        cost: 65.0,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Food",
        start_date: new Date("2024-05-01"),
        next_billing_date: daysFromNow(8),
        icon_key: "hellofresh",
    },
    {
        service_name: "Adobe Creative Cloud",
        cost: 54.99,
        currency: "USD" as const,
        billing_cycle: "MONTHLY" as const,
        category: "Software",
        start_date: new Date("2023-11-15"),
        next_billing_date: dayOfMonth(15),
        icon_key: "adobe",
    },
];

export async function GET() {
    // Find guest user
    const user = await prisma.user.findUnique({
        where: { email: "guest@ghost.finance" },
    });

    if (!user) {
        return NextResponse.json(
            { error: "Guest user not found. Create the user in Supabase first." },
            { status: 404 }
        );
    }

    // Clean slate - delete all existing subscriptions
    await prisma.subscription.deleteMany({
        where: { user_id: user.id },
    });

    // Update user settings
    await prisma.user.update({
        where: { id: user.id },
        data: {
            budget_limit: 1000,
            default_currency: "USD",
            name: "Guest User",
        },
    });

    // Insert demo subscriptions
    await prisma.subscription.createMany({
        data: SUBSCRIPTIONS.map((sub) => ({
            user_id: user.id,
            service_name: sub.service_name,
            cost: sub.cost,
            currency: sub.currency,
            billing_cycle: sub.billing_cycle,
            category: sub.category,
            start_date: sub.start_date,
            next_billing_date: sub.next_billing_date,
            icon_key: sub.icon_key,
            status: "ACTIVE" as const,
            is_trial: false,
        })),
    });

    return NextResponse.json({
        message: "Guest data seeded successfully",
        count: SUBSCRIPTIONS.length,
    });
}
