/**
 * Currency Context
 * 
 * Provides currency conversion and formatting across the app.
 * Users can switch between USD, EUR, and GBP.
 */

"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// Supported currencies
export type CurrencyCode = "USD" | "EUR" | "GBP";

// Exchange rates (relative to USD as base)
// These are approximate and could be fetched from an API in production
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
};

// Currency symbols
const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
};

interface CurrencyContextType {
    /** The user's selected base currency */
    baseCurrency: CurrencyCode;
    /** Set the base currency */
    setBaseCurrency: (currency: CurrencyCode) => void;
    /** Convert a price from one currency to the base currency */
    convertPrice: (amount: number, fromCurrency: CurrencyCode | string) => number;
    /** Format a price in the base currency with symbol */
    formatPrice: (amount: number) => string;
    /** Get the currency symbol for the base currency */
    getCurrencySymbol: () => string;
    /** Whether to show monthly equivalent costs for yearly subscriptions */
    showMonthlyCosts: boolean;
    /** Set the show monthly costs preference */
    setShowMonthlyCosts: (show: boolean) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
    children: ReactNode;
    /** Initial base currency (defaults to USD) */
    defaultCurrency?: CurrencyCode;
    /** Initial show monthly costs preference */
    initialShowMonthlyCosts?: boolean;
}

export function CurrencyProvider({
    children,
    defaultCurrency = "USD",
    initialShowMonthlyCosts = false,
}: CurrencyProviderProps) {
    const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(defaultCurrency);
    const [showMonthlyCosts, setShowMonthlyCosts] = useState<boolean>(initialShowMonthlyCosts);

    // Sync state when props change (e.g., after settings update)
    useEffect(() => {
        if (defaultCurrency) {
            setBaseCurrency(defaultCurrency);
        }
    }, [defaultCurrency]);

    useEffect(() => {
        setShowMonthlyCosts(initialShowMonthlyCosts);
    }, [initialShowMonthlyCosts]);

    /**
     * Convert price from source currency to base currency
     */
    const convertPrice = useCallback((amount: number, fromCurrency: CurrencyCode | string): number => {
        const from = fromCurrency as CurrencyCode;

        // If same currency, no conversion needed
        if (from === baseCurrency) {
            return amount;
        }

        // Convert to USD first (as intermediate), then to target
        const fromRate = EXCHANGE_RATES[from] || 1;
        const toRate = EXCHANGE_RATES[baseCurrency];

        // amount in source -> USD -> target
        const amountInUSD = amount / fromRate;
        const amountInTarget = amountInUSD * toRate;

        return amountInTarget;
    }, [baseCurrency]);

    /**
     * Format price in base currency with proper symbol and formatting
     */
    const formatPrice = useCallback((amount: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: baseCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }, [baseCurrency]);

    /**
     * Get the symbol for the current base currency
     */
    const getCurrencySymbol = useCallback((): string => {
        return CURRENCY_SYMBOLS[baseCurrency];
    }, [baseCurrency]);

    return (
        <CurrencyContext.Provider
            value={{
                baseCurrency,
                setBaseCurrency,
                convertPrice,
                formatPrice,
                getCurrencySymbol,
                showMonthlyCosts,
                setShowMonthlyCosts,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

/**
 * Hook to access currency context
 */
export function useCurrency(): CurrencyContextType {
    const context = useContext(CurrencyContext);

    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }

    return context;
}

export { CURRENCY_SYMBOLS, EXCHANGE_RATES };
