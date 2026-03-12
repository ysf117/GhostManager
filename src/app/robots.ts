/**
 * Robots.txt Configuration
 *
 * Instructs search engine crawlers which paths to index
 * and which to ignore. Internal app routes are disallowed
 * to prevent indexing of authenticated pages.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ghost-finance.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/dashboard",
                "/settings",
                "/subscriptions",
                "/payments",
                "/reports",
                "/search",
                "/api",
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
