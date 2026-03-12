import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/templates/Providers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { CurrencyCode } from "@/contexts/CurrencyContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ghost Finance - Subscription Manager",
  description:
    "Track and manage your subscriptions with Ghost Finance. An open-source subscription tracker built with Next.js, React, and Supabase.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  keywords: [
    "subscription manager",
    "finance tracker",
    "recurring payments",
    "open source",
    "next.js",
    "react",
    "supabase",
  ],
  openGraph: {
    title: "Ghost Finance - Subscription Manager",
    description:
      "Stop bleeding money on forgotten subscriptions. Track, manage, and cancel recurring payments with Ghost Finance.",
    url: "/",
    siteName: "Ghost Finance",
    type: "website",
    images: [
      {
        url: "/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "Ghost Finance Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost Finance - Subscription Manager",
    description:
      "Stop bleeding money on forgotten subscriptions. Track, manage, and cancel recurring payments.",
    images: ["/dashboard-preview.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user profile for preferences
  let initialCurrency: CurrencyCode = "USD";
  let initialShowMonthlyCosts = false;

  try {
    const supabase = await createClient();

    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { default_currency: true, show_monthly_costs: true },
      });
      if (user?.default_currency) {
        initialCurrency = user.default_currency as CurrencyCode;
      }
      if (user?.show_monthly_costs) {
        initialShowMonthlyCosts = user.show_monthly_costs;
      }
    }
  } catch {
    // Silently fallback to defaults on auth/db errors
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers initialCurrency={initialCurrency} initialShowMonthlyCosts={initialShowMonthlyCosts}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
