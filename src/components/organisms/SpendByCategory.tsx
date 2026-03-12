/**
 * SpendByCategory Component
 *
 * Pure donut chart + legend for category spending breakdown.
 * No card wrapper — parent handles the container styling.
 */

"use client";

import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export interface CategoryData {
    name: string;
    amount: number;
    percentage: number;
    color: string;
}

interface SpendByCategoryProps {
    data: CategoryData[];
    className?: string;
}

const CATEGORY_COLORS = [
    { stroke: "text-[#3d40f0]", dot: "bg-[#3d40f0]" },
    { stroke: "text-indigo-400", dot: "bg-indigo-400" },
    { stroke: "text-emerald-400", dot: "bg-emerald-400" },
    { stroke: "text-amber-400", dot: "bg-amber-400" },
    { stroke: "text-rose-400", dot: "bg-rose-400" },
    { stroke: "text-cyan-400", dot: "bg-cyan-400" },
];

export function SpendByCategory({ data, className = "" }: SpendByCategoryProps) {
    const { formatPrice } = useCurrency();

    const total = useMemo(() => {
        return data.reduce((sum, item) => sum + item.amount, 0);
    }, [data]);

    const chartSegments = useMemo(() => {
        let offset = 0;
        return data.map((cat, index) => {
            const segment = {
                ...cat,
                strokeDasharray: `${cat.percentage}, 100`,
                strokeDashoffset: -offset,
                colorClass: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            };
            offset += cat.percentage;
            return segment;
        });
    }, [data]);

    if (data.length === 0 || total === 0) {
        return (
            <div className={`w-full h-full flex flex-col ${className}`}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative size-48">
                        <svg className="size-full" viewBox="0 0 36 36">
                            <path
                                className="text-muted"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-muted-foreground text-sm">No data</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-4">
                    <span className="text-xs text-muted-foreground">
                        Add subscriptions to see your spending breakdown
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col ${className}`}>
            {/* Donut Chart */}
            <div className="flex-1 flex items-center justify-center">
                <div className="relative size-48">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-muted"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                        />
                        {chartSegments.map((segment) => (
                            <path
                                key={segment.name}
                                className={segment.colorClass.stroke}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray={segment.strokeDasharray}
                                strokeDashoffset={segment.strokeDashoffset}
                                strokeLinecap="round"
                                strokeWidth="3"
                            />
                        ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Total</p>
                        <p className="text-foreground text-xl font-bold">
                            {formatPrice(total)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                {chartSegments.slice(0, 4).map((segment) => (
                    <div key={segment.name} className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${segment.colorClass.dot}`}></div>
                        <span className="text-xs text-muted-foreground truncate">
                            {segment.name} ({Math.round(segment.percentage)}%)
                        </span>
                    </div>
                ))}
                {data.length > 4 && (
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-muted-foreground"></div>
                        <span className="text-xs text-muted-foreground">
                            +{data.length - 4} more
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SpendByCategory;
