import { SpotlightCard } from "@/components/molecules/SpotlightCard";
import { FEATURES, ACCENT_COLORS } from "@/lib/constants";

export function FeaturesSection() {
    return (
        <section id="features" className="py-32 relative" aria-labelledby="features-heading">
            <div className="max-w-7xl mx-auto px-6">
                <header className="text-center mb-16">
                    <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
                        Why you&apos;re losing money
                    </h2>
                    <p className="text-slate-400">The modern subscription economy is designed to make you forget.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {FEATURES.map((feature) => {
                        const colors = ACCENT_COLORS[feature.accentColor];
                        return (
                            <SpotlightCard
                                key={feature.title}
                                className={`glass-card p-8 rounded-2xl ${colors.border} transition-colors group`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className={`material-symbols-outlined text-9xl ${feature.bgIconRotate}`}>
                                        {feature.bgIcon}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text} mb-6 ${colors.bgHover} transition-colors ${colors.shadow}`}>
                                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                            </SpotlightCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
