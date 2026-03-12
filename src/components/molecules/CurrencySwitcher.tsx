/**
 * CurrencySwitcher Component
 * 
 * A dropdown to switch between currencies.
 * Updates the CurrencyContext when changed.
 */

"use client";

import { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency, CurrencyCode, CURRENCY_SYMBOLS } from "@/contexts/CurrencyContext";
import { Button } from "@/components/atoms/button";

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
    { code: "USD", label: "US Dollar" },
    { code: "EUR", label: "Euro" },
    { code: "GBP", label: "British Pound" },
];

export function CurrencySwitcher() {
    const { baseCurrency, setBaseCurrency } = useCurrency();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="px-3 py-2 bg-muted border border-border rounded-xl text-sm text-foreground">
                {CURRENCY_SYMBOLS[baseCurrency]} {baseCurrency}
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                    <span className="font-medium">{CURRENCY_SYMBOLS[baseCurrency]}</span>
                    <span>{baseCurrency}</span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="min-w-[160px] bg-popover border border-border rounded-xl p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95"
                >
                    {CURRENCIES.map((currency) => (
                        <DropdownMenu.Item
                            key={currency.code}
                            onClick={() => setBaseCurrency(currency.code)}
                            className="flex items-center justify-between gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent focus:outline-none focus:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-5 text-center font-medium text-muted-foreground">
                                    {CURRENCY_SYMBOLS[currency.code]}
                                </span>
                                <span className={baseCurrency === currency.code ? "text-foreground" : "text-muted-foreground"}>
                                    {currency.label}
                                </span>
                            </div>
                            {baseCurrency === currency.code && (
                                <Check className="size-4 text-[#3d40f0]" />
                            )}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default CurrencySwitcher;
