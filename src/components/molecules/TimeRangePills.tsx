/**
 * TimeRangePills Molecule
 *
 * Time range selector pills for chart sections.
 * Can be controlled (value + onChange) or uncontrolled.
 */

"use client";

import { useState } from "react";

export type TimeRange = "1W" | "1M" | "1Y";

const RANGES: TimeRange[] = ["1W", "1M", "1Y"];

interface TimeRangePillsProps {
    value?: TimeRange;
    onChange?: (range: TimeRange) => void;
}

export function TimeRangePills({ value, onChange }: TimeRangePillsProps) {
    const [internal, setInternal] = useState<TimeRange>("1M");
    const active = value ?? internal;

    const handleClick = (range: TimeRange) => {
        if (onChange) {
            onChange(range);
        } else {
            setInternal(range);
        }
    };

    return (
        <div className="flex gap-2">
            {RANGES.map((range) => (
                <button
                    key={range}
                    onClick={() => handleClick(range)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        active === range
                            ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                            : "text-muted-foreground hover:text-foreground bg-white/5 border border-transparent"
                    }`}
                >
                    {range}
                </button>
            ))}
        </div>
    );
}
