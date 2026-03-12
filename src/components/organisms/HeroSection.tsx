import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { BlurFade } from "@/components/atoms/BlurFade";
import { Levitate } from "@/components/atoms/Levitate";
import { TiltCard } from "@/components/atoms/TiltCard";
import { ShimmerButton } from "@/components/atoms/ShimmerButton";

export function HeroSection() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Ghost Finance",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        description:
            "An open-source subscription tracker to identify and cancel forgotten recurring payments.",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        url: "https://github.com/ysf117/GhostManager",
    };

    return (
        <section className="relative pt-32 pb-24 px-6" aria-labelledby="hero-heading">
            {/* JSON-LD Structured Data for Google Rich Snippets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Background glow wrapper */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-purple-600/30 blur-[120px]" />
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-950 to-transparent" />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10">
                {/* Badge */}
                <BlurFade delay={0}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-xs font-medium text-violet-300 mb-8 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                        </span>
                        Built with Next.js 16, React 19 &amp; Supabase
                    </div>
                </BlurFade>

                {/* Headline */}
                <BlurFade delay={0.15}>
                    <h1 id="hero-heading" className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        Stop Bleeding Money on <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Forgotten Subscriptions.
                        </span>
                    </h1>
                </BlurFade>

                {/* Subheading */}
                <BlurFade delay={0.3}>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Ghost Finance is an open-source subscription tracker leveraging{" "}
                        <span className="text-slate-300">React Server Components</span>,{" "}
                        <span className="text-slate-300">Server Actions</span>, and{" "}
                        <span className="text-slate-300">Tailwind CSS v4</span> to identify zombie subscriptions before they drain your account.
                    </p>
                </BlurFade>

                {/* CTA Buttons */}
                <BlurFade delay={0.45}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
                        <Link href="/login">
                            <ShimmerButton>
                                Try Demo
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </ShimmerButton>
                        </Link>
                        <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white/20 hover:bg-white/5 hover:border-white/40 font-bold text-base px-6 py-3 h-auto rounded-xl">
                            <Link href="https://github.com/ysf117/GhostManager" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <span className="material-symbols-outlined">code</span>
                                View Source
                            </Link>
                        </Button>
                    </div>
                </BlurFade>

                {/* Dashboard Preview */}
                <Levitate className="relative max-w-5xl mx-auto">
                    {/* 1. THE GLOW (Unmasked & Wide) */}
                    <div className="absolute -inset-x-20 -top-20 bottom-20 bg-purple-600/25 blur-[120px] rounded-[50%] -z-10 pointer-events-none" />

                    {/* 2. THE IMAGE (Masked + Cursor Tilt) */}
                    <TiltCard className="[mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
                        <div className="rounded-2xl border border-white/10 bg-[#0f172a] overflow-hidden relative shadow-[0_0_80px_-20px_rgba(124,58,237,0.4)]">
                            {/* Browser chrome */}
                            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-slate-950/80 backdrop-blur-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="ml-4 px-3 py-1 bg-white/5 rounded text-[10px] text-slate-500 font-mono w-64 border border-white/5 flex items-center">
                                    <span className="material-symbols-outlined text-[10px] mr-1">lock</span>
                                    ghost-finance.app/dashboard
                                </div>
                            </div>

                            {/* Dashboard mock content */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0f172a]/40 backdrop-blur-xl">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Spend</p>
                                    <p className="text-2xl font-bold text-white mt-1">$1,240.50</p>
                                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 w-2/3 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Subs</p>
                                    <p className="text-2xl font-bold text-white mt-1">12</p>
                                    <div className="flex -space-x-2 mt-3">
                                        {["A", "N", "S"].map((letter, i) => (
                                            <div key={letter} className={`w-6 h-6 rounded-full border-2 border-[#0f172a] text-[8px] flex items-center justify-center text-white font-bold ${["bg-blue-500", "bg-red-500", "bg-green-500"][i]}`}>
                                                {letter}
                                            </div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full bg-[#0f172a] border-2 border-slate-700 text-[8px] flex items-center justify-center text-slate-400 font-bold">
                                            +9
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Saved this month</p>
                                    <p className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
                                        +$42.00
                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                    </p>
                                    <p className="text-[10px] text-emerald-400/70 mt-2 bg-emerald-400/10 inline-block px-1.5 py-0.5 rounded border border-emerald-400/20">
                                        2 cancellations
                                    </p>
                                </div>

                                <div className="col-span-1 md:col-span-3 bg-white/5 p-6 rounded-xl border border-white/5 h-64 relative overflow-hidden flex flex-col justify-end">
                                    <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 to-transparent" />
                                    <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,30 L0,20 C10,18 20,25 30,22 C40,19 50,10 60,15 C70,20 80,5 90,10 C95,12 100,15 100,15 L100,30 Z" fill="url(#heroChartGrad)" />
                                        <path d="M0,20 C10,18 20,25 30,22 C40,19 50,10 60,15 C70,20 80,5 90,10 C95,12 100,15 100,15" fill="none" stroke="#8b5cf6" strokeLinecap="round" strokeWidth="0.5" />
                                    </svg>
                                    <div className="absolute top-4 left-4">
                                        <h4 className="text-sm font-semibold text-white">Spend Analysis</h4>
                                        <p className="text-xs text-slate-400">Last 30 Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </Levitate>
            </div>
        </section>
    );
}
