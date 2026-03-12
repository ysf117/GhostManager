/**
 * DashboardLayout Template
 *
 * The main layout wrapper for the dashboard.
 * Includes:
 * - Desktop sidebar with navigation
 * - Mobile bottom navigation (native-app style)
 * - Responsive header (compact on mobile, full on desktop)
 * - Floating Action Button on mobile
 * - Main content area
 */

"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sidebar } from "@/components/organisms/Sidebar";
import { MobileBottomNav } from "@/components/organisms/MobileBottomNav";
import { SearchModal } from "@/components/molecules/SearchModal";
import { UserNav } from "@/components/organisms/UserNav";
import { AddSubscriptionButton } from "@/components/organisms/AddSubscriptionButton";
import { CurrencySwitcher } from "@/components/molecules/CurrencySwitcher";
import { UserDropdown } from "@/components/molecules/UserDropdown";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { GhostLogo } from "@/components/atoms/GhostLogo";
import { Subscription } from "@/types/database";

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    userEmail?: string;
    userName?: string | null;
    userAvatarUrl?: string | null;
    subscriptions?: Subscription[];
    budgetLimit?: number;
}

export function DashboardLayout({
    children,
    title = "Spend Analysis",
    userEmail,
    userName,
    userAvatarUrl,
    subscriptions = [],
    budgetLimit,
}: DashboardLayoutProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Handle search - navigate to global search page
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    // Avatar source for mobile header
    const avatarSrc = userEmail
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`
        : undefined;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-border bg-sidebar hidden lg:flex flex-col sticky top-0 h-screen">
                <Sidebar
                    className="flex-1"
                    subscriptions={subscriptions}
                    budgetLimit={budgetLimit}
                />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Mobile Header */}
                <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-background">
                    {/* Left: Search Icon → opens SearchModal */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Search subscriptions"
                    >
                        <span className="material-symbols-outlined text-2xl">search</span>
                    </button>

                    {/* Center: Ghost Logo */}
                    <GhostLogo className="h-8 w-auto" />

                    {/* Right: Notification + Avatar → opens UserDropdown */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </Button>
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center p-0.5 rounded-full border-2 border-purple-500/30 hover:border-purple-500/60 transition-colors"
                                aria-label="Profile menu"
                                aria-expanded={profileOpen}
                            >
                                <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                    {avatarSrc ? (
                                        <Image
                                            alt="User avatar"
                                            className="w-full h-full object-cover"
                                            src={avatarSrc}
                                            width={32}
                                            height={32}
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-muted-foreground text-lg">person</span>
                                    )}
                                </div>
                            </button>
                            {profileOpen && (
                                <UserDropdown onClose={() => setProfileOpen(false)} />
                            )}
                        </div>
                    </div>
                </header>

                {/* Search Modal Overlay */}
                {searchOpen && (
                    <SearchModal onClose={() => setSearchOpen(false)} />
                )}

                {/* Desktop Header */}
                <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-background">
                    <div className="flex items-center gap-6 flex-1">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        <form onSubmit={handleSearch} className="max-w-md w-full relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                search
                            </span>
                            <Input
                                className="w-full pl-10 rounded-xl"
                                placeholder="Search subscriptions..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>
                    <div className="flex items-center gap-4">
                        <CurrencySwitcher />
                        <AddSubscriptionButton />
                        <Button variant="outline" size="icon" className="rounded-xl">
                            <span className="material-symbols-outlined">notifications</span>
                        </Button>
                        {userEmail ? (
                            <UserNav email={userEmail} name={userName} avatarUrl={userAvatarUrl ?? undefined} />
                        ) : (
                            <div className="h-10 w-10 rounded-full border-2 border-[#3d40f0]/30 p-0.5 bg-muted" />
                        )}
                    </div>
                </header>

                {/* Page Content - extra bottom padding on mobile for bottom nav */}
                <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full pb-28 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile FAB (Add Subscription) */}
            <AddSubscriptionButton mobile />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}

export default DashboardLayout;
