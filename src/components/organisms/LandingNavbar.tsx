"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { GhostLogo } from "@/components/atoms/GhostLogo";
import { MobileMenu } from "@/components/molecules/MobileMenu";
import { LANDING_NAV_LINKS } from "@/lib/constants";

export function LandingNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" aria-label="Ghost Finance Home">
                        <GhostLogo className="h-10 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        {LANDING_NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="hover:text-white transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block mr-2"
                        >
                            Log In
                        </Link>
                        <Button
                            asChild
                            className="bg-[#7c3aed] hover:bg-violet-600 text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.6)] hidden sm:inline-flex"
                        >
                            <Link href="/login">Try Demo</Link>
                        </Button>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="md:hidden text-gray-400 hover:text-white transition-colors"
                            aria-label="Toggle navigation"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {isMobileMenuOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileMenu
                        onClose={() => setIsMobileMenuOpen(false)}
                        links={LANDING_NAV_LINKS}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
