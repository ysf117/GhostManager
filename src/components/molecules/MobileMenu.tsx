"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import type { LandingNavLink } from "@/lib/constants";

interface MobileMenuProps {
    onClose: () => void;
    links: LandingNavLink[];
}

export function MobileMenu({ onClose, links }: MobileMenuProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-5 right-6 text-gray-400 hover:text-white transition-colors"
                aria-label="Close menu"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Nav links */}
            <nav className="flex flex-col items-center gap-6" aria-label="Mobile navigation">
                {links.map((link) => (
                    <a
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="text-2xl font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        {link.label}
                    </a>
                ))}
            </nav>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 mt-4">
                <Link
                    href="/login"
                    onClick={onClose}
                    className="text-lg text-gray-400 hover:text-white transition-colors"
                >
                    Log In
                </Link>
                <Button
                    asChild
                    size="lg"
                    className="bg-[#7c3aed] hover:bg-violet-600 text-white font-bold px-8 shadow-[0_0_20px_rgba(124,58,237,0.6)]"
                >
                    <Link href="/login" onClick={onClose}>
                        Try Demo
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}
