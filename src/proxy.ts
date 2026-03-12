/**
 * Next.js Proxy (formerly Middleware)
 * 
 * Handles authentication flow:
 * - Refreshes user session on every request
 * - Protects routes that require authentication
 * - Redirects logged-in users away from auth pages
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/subscriptions", "/payments", "/reports", "/settings"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/signup", "/auth"];

export async function proxy(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase keys missing - Auth disabled in proxy");
        return NextResponse.next({ request });
    }

    try {
        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        });

        // IMPORTANT: Do not use `getSession()` here - it reads from storage
        // which can be tampered with. Use `getUser()` which validates the JWT.
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const { pathname } = request.nextUrl;

        // Check if current path is a protected route
        const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
            pathname.startsWith(route)
        );

        // Check if current path is an auth route
        const isAuthRoute = AUTH_ROUTES.some((route) =>
            pathname.startsWith(route)
        );

        // Redirect unauthenticated users from protected routes to login
        if (!user && isProtectedRoute) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirectTo", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Redirect authenticated users from auth routes to dashboard
        if (user && isAuthRoute) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // IMPORTANT: Return the supabaseResponse to ensure cookies are set correctly
        return supabaseResponse;
    } catch (error) {
        console.warn("Supabase proxy error - allowing request to proceed:", error);
        return NextResponse.next({ request });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Public assets (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
