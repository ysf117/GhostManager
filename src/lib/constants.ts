/**
 * Centralized configuration and content constants.
 */

// ============================================================
// Dashboard Sidebar
// ============================================================

export interface NavItem {
    icon: string;
    label: string;
    href: string;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
    { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
    { icon: "subscriptions", label: "Subscriptions", href: "/subscriptions" },
    { icon: "payments", label: "Payments", href: "/payments" },
    { icon: "bar_chart", label: "Reports", href: "/reports" },
    { icon: "settings", label: "Settings", href: "/settings" },
];

// ============================================================
// Landing Page - Navigation
// ============================================================

export interface LandingNavLink {
    label: string;
    href: string;
}

export const LANDING_NAV_LINKS: LandingNavLink[] = [
    { label: "Features", href: "#features" },
    { label: "Overview", href: "#overview" },
    { label: "Get Started", href: "#cta" },
];

// ============================================================
// Landing Page - Hero
// ============================================================

export const HERO_BADGE_TEXT = "Built with Next.js 16, React 19 & Supabase";

export const HERO_HEADLINE = "Stop Bleeding Money on";
export const HERO_HEADLINE_GRADIENT = "Forgotten Subscriptions.";

export const HERO_SUBHEADING =
    "Ghost Finance is an open-source subscription tracker leveraging React Server Components, Server Actions, and Tailwind CSS v4 to identify zombie subscriptions before they drain your account.";

// ============================================================
// Landing Page - Features
// ============================================================

export interface Feature {
    icon: string;
    bgIcon: string;
    bgIconRotate: string;
    title: string;
    description: string;
    accentColor: "violet" | "cyan" | "pink";
}

export const FEATURES: Feature[] = [
    {
        icon: "visibility_off",
        bgIcon: "skull",
        bgIconRotate: "rotate-12",
        title: "Kill Zombie Subscriptions",
        description:
            "Identify and cancel unused services instantly. Smart detection finds subscriptions you forgot about.",
        accentColor: "violet",
    },
    {
        icon: "currency_exchange",
        bgIcon: "public",
        bgIconRotate: "-rotate-12",
        title: "Real-Time Currency",
        description:
            "Server-side conversion for USD, GBP, and EUR. International subscriptions normalized into your base currency automatically.",
        accentColor: "cyan",
    },
    {
        icon: "bar_chart",
        bgIcon: "analytics",
        bgIconRotate: "rotate-6",
        title: "Interactive Analytics",
        description:
            "Beautiful data visualization built with Recharts. Drill down by category, merchant, or time period.",
        accentColor: "pink",
    },
];

// ============================================================
// Landing Page - CTA
// ============================================================

export const CTA_HEADLINE = "Ready to exorcise your expenses?";
export const CTA_SUBHEADING =
    "Join users saving an average of $450/year on forgotten subscriptions.";

// ============================================================
// Landing Page - Footer
// ============================================================

export interface FooterLinkGroup {
    title: string;
    links: { label: string; href: string; external?: boolean }[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "Overview", href: "#overview" },
            { label: "Dashboard", href: "/login" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "https://github.com/ysf117/GhostManager/blob/main/docs/introduction.md", external: true },
            { label: "Changelog", href: "https://github.com/ysf117/GhostManager/commits/main", external: true },
            { label: "Support", href: "#" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "#" },
            { label: "Terms of Service", href: "#" },
        ],
    },
];

// ============================================================
// Theme / Colors
// ============================================================

export const LANDING_BG = "#0B0C15";

export const ACCENT_COLORS = {
    violet: {
        bg: "bg-violet-500/10",
        bgHover: "group-hover:bg-violet-500/20",
        text: "text-violet-400",
        border: "hover:border-violet-500/50",
        shadow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]",
    },
    cyan: {
        bg: "bg-cyan-500/10",
        bgHover: "group-hover:bg-cyan-500/20",
        text: "text-cyan-400",
        border: "hover:border-cyan-500/50",
        shadow: "shadow-[0_0_15px_rgba(34,211,238,0.2)]",
    },
    pink: {
        bg: "bg-pink-500/10",
        bgHover: "group-hover:bg-pink-500/20",
        text: "text-pink-400",
        border: "hover:border-pink-500/50",
        shadow: "shadow-[0_0_15px_rgba(236,72,153,0.2)]",
    },
} as const;
