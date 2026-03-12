/**
 * UserDropdown Molecule
 *
 * Mobile profile dropdown menu.
 * Closes on click-outside via a transparent backdrop.
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { signout } from "@/actions/auth";

interface UserDropdownProps {
    onClose: () => void;
}

export function UserDropdown({ onClose }: UserDropdownProps) {
    const [isPending, startTransition] = useTransition();

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

    const handleSignOut = () => {
        startTransition(async () => {
            await signout();
        });
    };

    return (
        <>
            {/* Transparent backdrop for click-outside */}
            <div
                className="fixed inset-0 z-[90]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 z-[91] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
                <Link
                    href="/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">settings</span>
                    <span>Settings</span>
                </Link>

                <div className="h-px bg-white/10" />

                <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">
                        {isPending ? "progress_activity" : "logout"}
                    </span>
                    <span>{isPending ? "Signing out..." : "Log out"}</span>
                </button>
            </div>
        </>
    );
}
