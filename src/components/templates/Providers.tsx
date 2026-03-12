/**
 * Providers - Client Component Wrapper
 *
 * use this to wrap application in context providers that require 'use client'
 */

"use client";

import { CurrencyProvider, CurrencyCode } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ProvidersProps {
    children: ReactNode;
    initialCurrency?: CurrencyCode;
    initialShowMonthlyCosts?: boolean;
}

export function Providers({ children, initialCurrency = "USD", initialShowMonthlyCosts = false }: ProvidersProps) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <CurrencyProvider defaultCurrency={initialCurrency} initialShowMonthlyCosts={initialShowMonthlyCosts}>
                {children}
            </CurrencyProvider>
        </ThemeProvider>
    );
}
