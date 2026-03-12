/**
 * Date Calculator Tests
 * 
 * Unit tests for the date-calculator utility.
 * Tests cover leap year handling, edge cases, and billing cycle calculations.
 */

import { describe, expect, it } from "vitest";
import {
    isLeapYear,
    getDaysInMonth,
    addMonths,
    addYears,
    calculateNextBillingDate,
    daysUntilBilling,
    formatBillingDate,
} from "./date-calculator";
import { BillingCycle } from "@/types";

// ============================================
// isLeapYear Tests
// ============================================
describe("isLeapYear", () => {
    it("should return true for years divisible by 4 but not 100", () => {
        expect(isLeapYear(2024)).toBe(true);
        expect(isLeapYear(2020)).toBe(true);
        expect(isLeapYear(2016)).toBe(true);
    });

    it("should return false for years divisible by 100 but not 400", () => {
        expect(isLeapYear(1900)).toBe(false);
        expect(isLeapYear(2100)).toBe(false);
        expect(isLeapYear(2200)).toBe(false);
    });

    it("should return true for years divisible by 400", () => {
        expect(isLeapYear(2000)).toBe(true);
        expect(isLeapYear(2400)).toBe(true);
        expect(isLeapYear(1600)).toBe(true);
    });

    it("should return false for common years", () => {
        expect(isLeapYear(2023)).toBe(false);
        expect(isLeapYear(2019)).toBe(false);
        expect(isLeapYear(2021)).toBe(false);
    });
});

// ============================================
// getDaysInMonth Tests
// ============================================
describe("getDaysInMonth", () => {
    it("should return correct days for standard months", () => {
        expect(getDaysInMonth(2024, 0)).toBe(31); // January
        expect(getDaysInMonth(2024, 2)).toBe(31); // March
        expect(getDaysInMonth(2024, 3)).toBe(30); // April
        expect(getDaysInMonth(2024, 4)).toBe(31); // May
        expect(getDaysInMonth(2024, 5)).toBe(30); // June
        expect(getDaysInMonth(2024, 6)).toBe(31); // July
        expect(getDaysInMonth(2024, 7)).toBe(31); // August
        expect(getDaysInMonth(2024, 8)).toBe(30); // September
        expect(getDaysInMonth(2024, 9)).toBe(31); // October
        expect(getDaysInMonth(2024, 10)).toBe(30); // November
        expect(getDaysInMonth(2024, 11)).toBe(31); // December
    });

    it("should return 29 for February in a leap year", () => {
        expect(getDaysInMonth(2024, 1)).toBe(29);
        expect(getDaysInMonth(2000, 1)).toBe(29);
    });

    it("should return 28 for February in a non-leap year", () => {
        expect(getDaysInMonth(2023, 1)).toBe(28);
        expect(getDaysInMonth(2100, 1)).toBe(28);
    });
});

// ============================================
// addMonths Tests
// ============================================
describe("addMonths", () => {
    it("should add months correctly for normal dates", () => {
        const jan15 = new Date(2024, 0, 15); // Jan 15, 2024
        const result = addMonths(jan15, 1);
        expect(result.getMonth()).toBe(1); // February
        expect(result.getDate()).toBe(15);
        expect(result.getFullYear()).toBe(2024);
    });

    it("should handle end-of-month edge cases (Jan 31 + 1 month)", () => {
        const jan31 = new Date(2024, 0, 31); // Jan 31, 2024 (leap year)
        const result = addMonths(jan31, 1);
        expect(result.getMonth()).toBe(1); // February
        expect(result.getDate()).toBe(29); // Feb has 29 days in 2024
        expect(result.getFullYear()).toBe(2024);
    });

    it("should handle Feb 29 in leap year to March", () => {
        const feb29 = new Date(2024, 1, 29); // Feb 29, 2024
        const result = addMonths(feb29, 1);
        expect(result.getMonth()).toBe(2); // March
        expect(result.getDate()).toBe(29);
        expect(result.getFullYear()).toBe(2024);
    });

    it("should handle year rollover (Dec + 1 month)", () => {
        const dec15 = new Date(2024, 11, 15); // Dec 15, 2024
        const result = addMonths(dec15, 1);
        expect(result.getMonth()).toBe(0); // January
        expect(result.getDate()).toBe(15);
        expect(result.getFullYear()).toBe(2025);
    });

    it("should add multiple months correctly", () => {
        const jan15 = new Date(2024, 0, 15);
        const result = addMonths(jan15, 6);
        expect(result.getMonth()).toBe(6); // July
        expect(result.getDate()).toBe(15);
        expect(result.getFullYear()).toBe(2024);
    });
});

// ============================================
// addYears Tests
// ============================================
describe("addYears", () => {
    it("should add years correctly for normal dates", () => {
        const jan15 = new Date(2024, 0, 15);
        const result = addYears(jan15, 1);
        expect(result.getFullYear()).toBe(2025);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
    });

    it("should handle Feb 29 leap year to non-leap year", () => {
        const feb29_2024 = new Date(2024, 1, 29); // Feb 29, 2024
        const result = addYears(feb29_2024, 1);
        expect(result.getFullYear()).toBe(2025);
        expect(result.getMonth()).toBe(1); // February
        expect(result.getDate()).toBe(28); // 2025 is not a leap year
    });

    it("should handle Feb 29 leap year to leap year", () => {
        const feb29_2024 = new Date(2024, 1, 29);
        const result = addYears(feb29_2024, 4);
        expect(result.getFullYear()).toBe(2028);
        expect(result.getMonth()).toBe(1);
        expect(result.getDate()).toBe(29); // 2028 is a leap year
    });
});

// ============================================
// calculateNextBillingDate Tests
// ============================================
describe("calculateNextBillingDate", () => {
    describe("MONTHLY billing cycle", () => {
        it("should return next month when start date is in the past", () => {
            const startDate = new Date(2024, 0, 15); // Jan 15, 2024
            const referenceDate = new Date(2024, 1, 10); // Feb 10, 2024

            const result = calculateNextBillingDate(
                startDate,
                BillingCycle.MONTHLY,
                referenceDate
            );

            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(15);
        });

        it("should skip to next month if reference is past billing day", () => {
            const startDate = new Date(2024, 0, 15); // Jan 15, 2024
            const referenceDate = new Date(2024, 1, 20); // Feb 20, 2024 (past Feb 15)

            const result = calculateNextBillingDate(
                startDate,
                BillingCycle.MONTHLY,
                referenceDate
            );

            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(2); // March
            expect(result.getDate()).toBe(15);
        });

        it("should handle end-of-month subscriptions", () => {
            const startDate = new Date(2024, 0, 31); // Jan 31, 2024
            const referenceDate = new Date(2024, 1, 1); // Feb 1, 2024

            const result = calculateNextBillingDate(
                startDate,
                BillingCycle.MONTHLY,
                referenceDate
            );

            // Feb 2024 has 29 days (leap year), so next billing is Feb 29
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(29);
        });
    });

    describe("YEARLY billing cycle", () => {
        it("should return next year when start date is in the past", () => {
            const startDate = new Date(2023, 5, 15); // June 15, 2023
            const referenceDate = new Date(2024, 0, 10); // Jan 10, 2024

            const result = calculateNextBillingDate(
                startDate,
                BillingCycle.YEARLY,
                referenceDate
            );

            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(5); // June
            expect(result.getDate()).toBe(15);
        });

        it("should handle Feb 29 yearly subscriptions", () => {
            const startDate = new Date(2024, 1, 29); // Feb 29, 2024
            const referenceDate = new Date(2024, 5, 1); // June 1, 2024

            const result = calculateNextBillingDate(
                startDate,
                BillingCycle.YEARLY,
                referenceDate
            );

            // 2025 is not a leap year, so Feb 29 becomes Feb 28
            expect(result.getFullYear()).toBe(2025);
            expect(result.getMonth()).toBe(1); // February
            expect(result.getDate()).toBe(28);
        });
    });
});

// ============================================
// daysUntilBilling Tests
// ============================================
describe("daysUntilBilling", () => {
    it("should calculate days until billing correctly", () => {
        const nextBilling = new Date(2024, 1, 15); // Feb 15, 2024
        const reference = new Date(2024, 1, 10); // Feb 10, 2024

        expect(daysUntilBilling(nextBilling, reference)).toBe(5);
    });

    it("should return 0 if billing date is today", () => {
        const today = new Date(2024, 1, 15);
        const reference = new Date(2024, 1, 15);

        expect(daysUntilBilling(today, reference)).toBe(0);
    });

    it("should return 0 if billing date is in the past", () => {
        const pastDate = new Date(2024, 1, 10);
        const reference = new Date(2024, 1, 15);

        expect(daysUntilBilling(pastDate, reference)).toBe(0);
    });
});

// ============================================
// formatBillingDate Tests
// ============================================
describe("formatBillingDate", () => {
    it("should format date correctly for en-US locale", () => {
        const date = new Date(2024, 1, 15); // Feb 15, 2024
        const result = formatBillingDate(date, "en-US");

        expect(result).toBe("February 15, 2024");
    });

    it("should format date correctly for en-GB locale", () => {
        const date = new Date(2024, 1, 15); // Feb 15, 2024
        const result = formatBillingDate(date, "en-GB");

        expect(result).toBe("15 February 2024");
    });
});
