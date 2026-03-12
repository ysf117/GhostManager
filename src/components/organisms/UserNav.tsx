/**
 * UserNav Component
 * 
 * User dropdown menu with avatar trigger.
 * Shows user email and logout option.
 * 
 * Note: Uses mounted state to prevent hydration mismatch with Radix UI.
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { signout } from "@/actions/auth";

interface UserNavProps {
    /** User email to display */
    email: string;
    /** User display name */
    name?: string | null;
    /** Optional avatar URL */
    avatarUrl?: string;
}

export function UserNav({ email, name, avatarUrl }: UserNavProps) {
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    // Only render dropdown after client-side hydration to prevent ID mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = () => {
        startTransition(async () => {
            await signout();
        });
    };

    // Generate avatar from email if no URL provided
    const avatarSrc = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

    // Show static avatar during SSR/hydration
    if (!mounted) {
        return (
            <div className="flex items-center gap-2 p-1 rounded-full border-2 border-[#3d40f0]/30">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    <Image
                        alt="User avatar"
                        className="w-full h-full object-cover"
                        src={avatarSrc}
                        width={36}
                        height={36}
                        unoptimized
                    />
                </div>
            </div>
        );
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-2 p-1 rounded-full border-2 border-[#3d40f0]/30 hover:border-[#3d40f0]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d40f0]/50"
                    aria-label="User menu"
                >
                    <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        <Image
                            alt="User avatar"
                            className="w-full h-full object-cover"
                            src={avatarSrc}
                            width={36}
                            height={36}
                            unoptimized
                        />
                    </div>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="min-w-[220px] bg-popover border border-border rounded-xl p-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95"
                >
                    {/* User Info */}
                    <DropdownMenu.Label className="px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border border-border">
                                <Image
                                    alt="User avatar"
                                    className="w-full h-full object-cover"
                                    src={avatarSrc}
                                    width={40}
                                    height={40}
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {name || "Account"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {email}
                                </p>
                            </div>
                        </div>
                    </DropdownMenu.Label>

                    <DropdownMenu.Separator className="h-px bg-border my-2" />

                    {/* Settings Link */}
                    <DropdownMenu.Item asChild>
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground rounded-lg cursor-pointer hover:bg-accent hover:text-foreground focus:outline-none focus:bg-accent transition-colors w-full"
                        >
                            <Settings className="size-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px bg-border my-2" />

                    {/* Log Out */}
                    <DropdownMenu.Item
                        onClick={handleSignOut}
                        disabled={isPending}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-lg cursor-pointer hover:bg-red-500/10 focus:outline-none focus:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                                <span>Signing out...</span>
                            </>
                        ) : (
                            <>
                                <LogOut className="size-4" />
                                <span>Log out</span>
                            </>
                        )}
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}

export default UserNav;
