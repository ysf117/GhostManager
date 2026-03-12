/**
 * SearchModal Organism
 *
 * Full-screen search overlay for mobile.
 * Auto-focuses input, closes on Escape or Cancel.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    onClose: () => void;
}

const RECENT_SEARCHES = [
    "Netflix",
    "Spotify",
    "Adobe Creative Cloud",
    "GitHub Pro",
    "iCloud+",
];

export function SearchModal({ onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onClose();
        }
    };

    const handleRecentClick = (term: string) => {
        router.push(`/search?q=${encodeURIComponent(term)}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
                <form onSubmit={handleSubmit} className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        search
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search subscriptions..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lg text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition-colors"
                    />
                </form>
                <button
                    onClick={onClose}
                    className="text-purple-400 font-medium text-sm shrink-0 px-2 py-2"
                >
                    Cancel
                </button>
            </div>

            {/* Body: Recent Searches */}
            <div className="flex-1 overflow-y-auto px-4 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
                    Recent Searches
                </p>
                <ul className="space-y-1">
                    {RECENT_SEARCHES.map((term) => (
                        <li key={term}>
                            <button
                                onClick={() => handleRecentClick(term)}
                                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors text-left"
                            >
                                <span className="material-symbols-outlined text-gray-500 text-xl">
                                    history
                                </span>
                                <span className="text-sm">{term}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
