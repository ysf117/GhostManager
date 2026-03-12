"use client";

import { useState } from "react";
import { PieChart, Pie, Cell } from "recharts";

const DATA = [
    { name: "Entertainment", value: 1080, color: "#6366f1", percent: "45%" },
    { name: "Software", value: 720, color: "#a855f7", percent: "30%" },
    { name: "Health", value: 600, color: "#ec4899", percent: "25%" },
];

const TOTAL = DATA.reduce((sum, d) => sum + d.value, 0);

function formatValue(value: number): string {
    return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
}

export function LandingPageChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const centerValue = activeIndex !== null ? `$${DATA[activeIndex].value.toLocaleString()}` : formatValue(TOTAL);
    const centerLabel = activeIndex !== null ? DATA[activeIndex].name : "Monthly";

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            {/* Donut Chart */}
            <div className="w-52 h-52 shrink-0 relative">
                <PieChart width={208} height={208}>
                    <Pie
                        data={DATA}
                        cx={104}
                        cy={104}
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        {DATA.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                fill={entry.color}
                                fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                style={{
                                    filter: activeIndex === null || activeIndex === index
                                        ? `drop-shadow(0 0 8px ${entry.color}80)`
                                        : "none",
                                    cursor: "pointer",
                                    transition: "fill-opacity 0.2s ease",
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            />
                        ))}
                    </Pie>
                </PieChart>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-white transition-all duration-200">
                        {centerValue}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 transition-all duration-200">
                        {centerLabel}
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-4">
                {DATA.map((entry, index) => (
                    <div
                        key={entry.name}
                        className="flex items-center gap-3 cursor-pointer transition-opacity duration-200"
                        style={{
                            opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                                backgroundColor: entry.color,
                                boxShadow: activeIndex === null || activeIndex === index
                                    ? `0 0 8px ${entry.color}80`
                                    : "none",
                            }}
                        />
                        <div>
                            <p className="text-sm font-medium text-white">{entry.name}</p>
                            <p className="text-xs text-slate-500">
                                {entry.percent} &middot; ${entry.value.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
