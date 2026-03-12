/**
 * Date Calculator Utility
 * 
 * Utility functions for calculating subscription billing dates.
 * Reference: docs/architecture.md Section 4.1
 * 
 * REQUIREMENT: Calculate `next_billing_date` based on `start_date` and `billing_cycle`.
 * Must handle leap years correctly.
 */

import { BillingCycle } from "@/types";

/**
 * Checks if a given year is a leap year.
 * 
 * A leap year is:
 * - Divisible by 4
 * - BUT NOT divisible by 100, UNLESS also divisible by 400
 * 
 * @param year - The year to check
 * @returns true if the year is a leap year
 */
export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Gets the number of days in a given month.
 * Correctly handles February in leap years.
 * 
 * @param year - The year
 * @param month - The month (0-11, where 0 = January)
 * @returns The number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
    // Month is 0-indexed (0 = January, 11 = December)
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month === 1 && isLeapYear(year)) {
        return 29;
    }

    return daysInMonth[month];
}

/**
 * Adds months to a date, handling end-of-month edge cases.
 * 
 * For example:
 * - Jan 31 + 1 month = Feb 28 (or Feb 29 in leap year)
 * - Jan 30 + 1 month = Feb 28 (or Feb 29 in leap year)
 * 
 * @param date - The starting date
 * @param months - Number of months to add
 * @returns A new Date with the months added
 */
export function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const originalDay = result.getDate();

    // Set to the first of the month to avoid overflow issues
    result.setDate(1);

    // Add the months
    result.setMonth(result.getMonth() + months);

    // Get the max days in the target month
    const maxDays = getDaysInMonth(result.getFullYear(), result.getMonth());

    // Set the day to the minimum of original day and max days in month
    result.setDate(Math.min(originalDay, maxDays));

    return result;
}

/**
 * Adds years to a date, handling leap year edge cases.
 * 
 * For example:
 * - Feb 29, 2024 + 1 year = Feb 28, 2025 (2025 is not a leap year)
 * 
 * @param date - The starting date
 * @param years - Number of years to add
 * @returns A new Date with the years added
 */
export function addYears(date: Date, years: number): Date {
    const result = new Date(date);
    const originalDay = result.getDate();
    const originalMonth = result.getMonth();

    // Set to the first of the month to avoid overflow issues
    result.setDate(1);

    // Add the years
    result.setFullYear(result.getFullYear() + years);

    // Get the max days in the target month
    const maxDays = getDaysInMonth(result.getFullYear(), originalMonth);

    // Set the day to the minimum of original day and max days in month
    result.setDate(Math.min(originalDay, maxDays));

    return result;
}

/**
 * Calculates the next billing date based on start date and billing cycle.
 * 
 * This function determines the next date when a subscription will be billed,
 * starting from a given start date. If the subscription has already passed
 * one or more billing cycles, it calculates the next upcoming billing date.
 * 
 * @param startDate - The date when the subscription started
 * @param billingCycle - The billing cycle (MONTHLY or YEARLY)
 * @param referenceDate - Optional reference date to calculate from (defaults to current date)
 * @returns The next billing date
 * 
 * @example
 * // Monthly subscription started on Jan 15, 2024
 * // If today is Feb 10, 2024, next billing is Feb 15, 2024
 * calculateNextBillingDate(new Date("2024-01-15"), BillingCycle.MONTHLY)
 * 
 * @example
 * // Yearly subscription started on Jan 31, 2024
 * // Next billing in 2025 will be Jan 31, 2025
 * calculateNextBillingDate(new Date("2024-01-31"), BillingCycle.YEARLY)
 */
export function calculateNextBillingDate(
    startDate: Date,
    billingCycle: BillingCycle,
    referenceDate: Date = new Date()
): Date {
    // Normalize dates to midnight for consistent comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const reference = new Date(referenceDate);
    reference.setHours(0, 0, 0, 0);

    // Start from the start date
    let nextBilling = new Date(start);

    // Keep adding billing periods until we find a date in the future
    while (nextBilling <= reference) {
        if (billingCycle === BillingCycle.MONTHLY) {
            nextBilling = addMonths(nextBilling, 1);
        } else {
            nextBilling = addYears(nextBilling, 1);
        }
    }

    return nextBilling;
}

/**
 * Calculates how many days until the next billing date.
 * 
 * @param nextBillingDate - The next billing date
 * @param referenceDate - Optional reference date (defaults to current date)
 * @returns Number of days until next billing
 */
export function daysUntilBilling(
    nextBillingDate: Date,
    referenceDate: Date = new Date()
): number {
    const next = new Date(nextBillingDate);
    next.setHours(0, 0, 0, 0);

    const reference = new Date(referenceDate);
    reference.setHours(0, 0, 0, 0);

    const diffTime = next.getTime() - reference.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Formats a billing date for display.
 * 
 * @param date - The date to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatBillingDate(
    date: Date,
    locale: string = "en-US"
): string {
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
