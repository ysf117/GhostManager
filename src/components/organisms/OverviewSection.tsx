import { LandingPageChart } from "@/components/molecules/LandingPageChart";

export function OverviewSection() {
    return (
        <section id="overview" className="py-32 relative" aria-labelledby="overview-heading">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-12">
                    <h2 id="overview-heading" className="text-3xl md:text-4xl font-bold mb-4">Complete Financial Clarity</h2>
                    <p className="text-slate-400 max-w-xl">Everything you need to take back control of your recurring expenses.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 md:auto-rows-[280px]">
                    {/* Visual Reports - large card */}
                    <div className="rounded-3xl p-8 md:col-span-2 md:row-span-2 border border-white/10 relative overflow-hidden flex flex-col bg-white/5 backdrop-blur-md">
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 mb-4">
                                <span className="material-symbols-outlined">pie_chart</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Visual Reports</h3>
                            <p className="text-slate-400 text-sm max-w-sm">
                                See exactly where your money goes with beautiful, interactive breakdowns by category, merchant, or time period.
                            </p>
                        </div>
                        <div className="flex-1 mt-8 flex items-center justify-center">
                            <LandingPageChart />
                        </div>
                    </div>

                    {/* Budget Enforcer */}
                    <article className="rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between bg-white/5 backdrop-blur-md">
                        <div>
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Budget Enforcer</h3>
                            <p className="text-slate-400 text-xs">Set hard limits. We&apos;ll warn you when you&apos;re close.</p>
                        </div>
                        <div className="mt-6">
                            <div className="flex items-end justify-between mb-3">
                                <span className="text-xs text-slate-400 font-medium">Monthly Limit</span>
                                <span className="text-2xl font-bold text-emerald-400">82%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={82} aria-valuemin={0} aria-valuemax={100} aria-label="Budget usage">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[82%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </article>

                    {/* Privacy First */}
                    <article className="rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between bg-white/5 backdrop-blur-md">
                        <div>
                            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <span className="material-symbols-outlined text-2xl">lock</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Privacy First</h3>
                            <p className="text-slate-400 text-xs">Your data stays yours. We never sell your information.</p>
                        </div>
                        <div className="mt-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-xs font-medium text-green-400">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                End-to-end encrypted
                            </span>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
