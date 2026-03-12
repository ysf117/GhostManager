/**
 * Authentication Server Actions
 * 
 * Handles login and signup flows using Supabase Auth.
 * These are Next.js Server Actions that run on the server.
 * 
 * Actions use the (prevState, formData) signature for useActionState compatibility.
 */

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = {
    success: boolean;
    message: string;
};

/**
 * Sign in with email and password
 */
export async function login(
    prevState: AuthResult,
    formData: FormData
): Promise<AuthResult> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required",
        };
    }

    const supabase = await createClient();

    if (!supabase) {
        return { success: false, message: "Authentication service unavailable" };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("[Auth] Login error:", error.message);
        return {
            success: false,
            message: error.message,
        };
    }

    // Redirect to dashboard on success
    redirect("/dashboard");
}

/**
 * Sign up with email and password
 */
export async function signup(
    prevState: AuthResult,
    formData: FormData
): Promise<AuthResult> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required",
        };
    }

    if (password.length < 6) {
        return {
            success: false,
            message: "Password must be at least 6 characters",
        };
    }

    const supabase = await createClient();

    if (!supabase) {
        return { success: false, message: "Authentication service unavailable" };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        },
    });

    if (error) {
        console.error("[Auth] Signup error:", error.message);
        return {
            success: false,
            message: error.message,
        };
    }

    return {
        success: true,
        message: "Check your email to confirm your account.",
    };
}

/**
 * Sign out the current user
 */
export async function signout(): Promise<void> {
    const supabase = await createClient();
    if (supabase) {
        await supabase.auth.signOut();
    }
    redirect("/login");
}
