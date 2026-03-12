/**
 * Auth Callback Route Handler
 * 
 * Handles the OAuth/Email confirmation callback from Supabase.
 * Exchanges the auth code for a session and redirects to dashboard.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();

        if (!supabase) {
            return NextResponse.redirect(`${origin}/login?error=auth_service_unavailable`);
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Successful auth - redirect to intended destination
            return NextResponse.redirect(`${origin}${next}`);
        }

        console.error("[Auth Callback] Error exchanging code:", error.message);
    }

    // If no code or error, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
