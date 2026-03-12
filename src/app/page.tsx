/**
 * Landing Page
 *
 * Marketing page for Ghost Finance.
 * Server Component that composes organism-level sections.
 */

import { LandingNavbar } from "@/components/organisms/LandingNavbar";
import { HeroSection } from "@/components/organisms/HeroSection";
import { FeaturesSection } from "@/components/organisms/FeaturesSection";
import { OverviewSection } from "@/components/organisms/OverviewSection";
import { CTASection } from "@/components/organisms/CTASection";
import { LandingFooter } from "@/components/organisms/LandingFooter";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
            <LandingNavbar />
            <main className="relative">
                <HeroSection />

                {/* Ambient mist: between Hero and Features */}
                <div className="relative" aria-hidden="true">
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
                </div>

                <FeaturesSection />

                <OverviewSection />
                <CTASection />
            </main>

            {/* Footer Abyss Transition */}
            <div className="bg-gradient-to-t from-black to-transparent h-32 -mt-32 relative z-10 pointer-events-none" />
            <LandingFooter />
        </div>
    );
}
