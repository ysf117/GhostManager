/**
 * TopSpendersChart Organism
 *
 * A horizontal bar chart showing the top 5 most expensive subscriptions.
 * Uses Recharts BarChart with vertical layout and CurrencyContext for formatting.
 */

"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TopSpendersChartProps {
    subscriptions: Subscription[];
}

const BAR_COLORS = [
    "#3d40f0",
    "#6366f1",
    "#818cf8",
    "#a5b4fc",
    "#c7d2fe",
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string; monthlyCost: number } }>;
    formatPrice: (amount: number) => string;
}

function ChartTooltip({ active, payload, formatPrice }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
        <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl">
            <p className="text-xs text-muted-foreground font-bold">{data.name}</p>
            <p className="text-foreground text-lg font-bold">
                {formatPrice(data.monthlyCost)}
                <span className="text-muted-foreground text-xs font-normal">/mo</span>
            </p>
        </div>
    );
}

export function TopSpendersChart({ subscriptions }: TopSpendersChartProps) {
    const { convertPrice, formatPrice } = useCurrency();

    const chartData = useMemo(() => {
        return subscriptions
            .filter((s) => s.status === SubscriptionStatus.ACTIVE && !s.is_trial)
            .map((sub) => {
                const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
                const monthlyCost = convertPrice(cost, sub.currency);
                return {
                    name: sub.service_name,
                    monthlyCost: Math.round(monthlyCost * 100) / 100,
                };
            })
            .sort((a, b) => b.monthlyCost - a.monthlyCost)
            .slice(0, 5);
    }, [subscriptions, convertPrice]);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                No active subscriptions to display
            </div>
        );
    }

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                    <XAxis
                        type="number"
                        hide
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fill: "currentColor", fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-foreground"
                    />
                    <Tooltip
                        content={<ChartTooltip formatPrice={formatPrice} />}
                        cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
                    />
                    <Bar
                        dataKey="monthlyCost"
                        radius={[0, 8, 8, 0]}
                        barSize={28}
                    >
                        {chartData.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
