import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { CTA_HEADLINE, CTA_SUBHEADING } from "@/lib/constants";

export function CTASection() {
    return (
        <section id="cta" className="py-32 relative overflow-hidden" aria-labelledby="cta-heading">
            {/* Floor Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                    {CTA_HEADLINE}
                </h2>
                <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                    {CTA_SUBHEADING}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <Button asChild size="lg" className="flex-1 h-12 px-8 text-lg bg-[#7c3aed] hover:bg-violet-600 text-white font-bold rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition-all hover:-translate-y-0.5">
                        <Link href="/login">Get Started Free</Link>
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-6">Open source &amp; free for personal use.</p>
            </div>
        </section>
    );
}
