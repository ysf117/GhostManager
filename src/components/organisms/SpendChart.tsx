/**
 * SpendChart Organism
 *
 * An area chart displaying subscription spending over time.
 * Features:
 * - Time range switching (1W / 1M / 1Y) with real data generation
 * - Dynamic currency conversion via CurrencyContext
 * - Integrated header with title and filter pills
 * - Constrained desktop layout
 */

"use client";

import { useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { Subscription, BillingCycle, SubscriptionStatus } from "@/types/database";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TimeRangePills, type TimeRange } from "@/components/molecules/TimeRangePills";

interface SpendChartProps {
    data: Subscription[];
}

interface ChartDataPoint {
    name: string;
    label: string;
    spend: number;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartDataPoint }>;
    formatPrice: (amount: number) => string;
}

function CustomTooltip({ active, payload, formatPrice }: CustomTooltipProps) {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const data = payload[0].payload;

    return (
        <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                {data.label}
            </p>
            <p className="text-foreground text-lg font-bold">
                {formatPrice(data.spend)}
            </p>
        </div>
    );
}

// ─── Data generation helpers ───────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function getMonthEndDate(year: number, month: number): Date {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

/**
 * Calculates the total monthly spend for subscriptions active at a given date.
 */
function calcSpendAtDate(
    subs: Subscription[],
    date: Date,
    convertPrice: (amount: number, currency: string) => number,
): number {
    return subs
        .filter((sub) => {
            const started = new Date(sub.start_date) <= date;
            const active = sub.status === SubscriptionStatus.ACTIVE;
            return started && active && !sub.is_trial;
        })
        .reduce((total, sub) => {
            const cost = sub.billing_cycle === BillingCycle.YEARLY ? sub.cost / 12 : sub.cost;
            return total + convertPrice(cost, sub.currency);
        }, 0);
}

/** 1W: Last 7 days — daily snapshots of total monthly subscription cost */
function generate1W(
    subs: Subscription[],
    convertPrice: (amount: number, currency: string) => number,
): ChartDataPoint[] {
    const today = new Date();
    const points: ChartDataPoint[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const spend = calcSpendAtDate(subs, d, convertPrice);
        points.push({
            name: DAY_NAMES[d.getDay()],
            label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            spend: Math.round(spend * 100) / 100,
        });
    }
    return points;
}

/** 1M: Last 6 months — monthly totals */
function generate1M(
    subs: Subscription[],
    convertPrice: (amount: number, currency: string) => number,
): ChartDataPoint[] {
    const today = new Date();
    const points: ChartDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
        let m = today.getMonth() - i;
        let y = today.getFullYear();
        while (m < 0) { m += 12; y -= 1; }

        const endDate = getMonthEndDate(y, m);
        const spend = calcSpendAtDate(subs, endDate, convertPrice);

        points.push({
            name: MONTH_NAMES_SHORT[m],
            label: `${MONTH_NAMES_FULL[m]} ${y}`,
            spend: Math.round(spend * 100) / 100,
        });
    }
    return points;
}

/** 1Y: Last 12 months — monthly totals */
function generate1Y(
    subs: Subscription[],
    convertPrice: (amount: number, currency: string) => number,
): ChartDataPoint[] {
    const today = new Date();
    const points: ChartDataPoint[] = [];

    for (let i = 11; i >= 0; i--) {
        let m = today.getMonth() - i;
        let y = today.getFullYear();
        while (m < 0) { m += 12; y -= 1; }

        const endDate = getMonthEndDate(y, m);
        const spend = calcSpendAtDate(subs, endDate, convertPrice);

        points.push({
            name: MONTH_NAMES_SHORT[m],
            label: `${MONTH_NAMES_FULL[m]} ${y}`,
            spend: Math.round(spend * 100) / 100,
        });
    }
    return points;
}

// ─── Component ─────────────────────────────────────────────────

export function SpendChart({ data }: SpendChartProps) {
    const { convertPrice, formatPrice } = useCurrency();
    const [timeRange, setTimeRange] = useState<TimeRange>("1M");

    const chartData = useMemo(() => {
        switch (timeRange) {
            case "1W":
                return generate1W(data, convertPrice);
            case "1M":
                return generate1M(data, convertPrice);
            case "1Y":
                return generate1Y(data, convertPrice);
        }
    }, [data, timeRange, convertPrice]);

    const maxSpend = Math.max(...chartData.map((d) => d.spend), 0);
    const yAxisMax = maxSpend === 0 ? 100 : Math.ceil(maxSpend / 50) * 50 + 50;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-foreground truncate">
                        {timeRange === "1W" ? "Weekly" : timeRange === "1M" ? "Monthly" : "Yearly"} Spend
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                        Track your subscription costs over time
                    </p>
                </div>
                <TimeRangePills value={timeRange} onChange={setTimeRange} />
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[200px] w-full mt-2 outline-none focus:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                        {/* Gradient Definitions */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#a855f7" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        {/* Subtle grid */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                            opacity={0.2}
                            vertical={false}
                        />

                        {/* Axes */}
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            height={30}
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                        />
                        <YAxis
                            domain={[0, "auto"]}
                            width={65}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                            tickFormatter={(value: number) => `$${value}`}
                            tick={{ fontSize: 12, fill: "#94a3b8", textAnchor: "end" }}
                        />

                        {/* Tooltip */}
                        <Tooltip
                            content={<CustomTooltip formatPrice={formatPrice} />}
                            cursor={{ stroke: "currentColor", strokeOpacity: 0.15, strokeWidth: 1 }}
                        />

                        {/* Area fill */}
                        <Area
                            type="monotone"
                            dataKey="spend"
                            stroke="none"
                            fill="url(#chartGradient)"
                            dot={false}
                            activeDot={false}
                        />

                        {/* Line stroke */}
                        <Line
                            type="monotone"
                            dataKey="spend"
                            stroke="#22d3ee"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: "#22d3ee",
                                stroke: "white",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default SpendChart;
