/**
 * Login Page
 * 
 * Authentication page with email/password login and signup.
 * Uses Server Actions for form submission.
 */

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import { login, signup, type AuthResult } from "@/actions/auth";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { GhostLogo } from "@/components/atoms/GhostLogo";
import { cn } from "@/lib/utils";

const initialState: AuthResult = {
    success: false,
    message: "",
};

export default function LoginPage() {
    const [loginState, loginAction, isLoginPending] = useActionState(login, initialState);
    const [signupState, signupAction, isSignupPending] = useActionState(signup, initialState);

    const isPending = isLoginPending || isSignupPending;
    const error = loginState.message && !loginState.success ? loginState.message : null;
    const successMessage = signupState.success ? signupState.message : null;

    return (
        <div className="min-h-screen bg-[#101122] flex items-center justify-center p-4 relative">
            {/* Back to Home */}
            <Link
                href="/"
                className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-white transition-colors z-10"
            >
                <ChevronLeft className="size-4" />
                Back
            </Link>

            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3d40f0]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="glass-card rounded-2xl border border-white/10 p-8 backdrop-blur-xl bg-[#1a1b2e]/80">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center mb-8">
                        <GhostLogo className="mx-auto mb-4 w-64 h-20" />
                        <p className="text-zinc-400 text-sm">Track your subscriptions effortlessly</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                disabled={isPending}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus:border-[#3d40f0]/50 focus:ring-[#3d40f0]/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={isPending}
                                className="bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus:border-[#3d40f0]/50 focus:ring-[#3d40f0]/20"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                type="submit"
                                formAction={loginAction}
                                disabled={isPending}
                                className={cn(
                                    "w-full bg-[#3d40f0] hover:bg-[#3d40f0]/90 text-white font-bold py-2.5",
                                    isPending && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isLoginPending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-[#1a1b2e] px-2 text-zinc-500">or</span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                formAction={signupAction}
                                disabled={isPending}
                                variant="outline"
                                className={cn(
                                    "w-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white font-medium py-2.5",
                                    isPending && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isSignupPending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Guest Login */}
                    <form className="mt-4">
                        <input type="hidden" name="email" value="guest@ghost.finance" />
                        <input type="hidden" name="password" value="password123" />
                        <Button
                            type="submit"
                            formAction={loginAction}
                            disabled={isPending}
                            variant="outline"
                            className={cn(
                                "w-full border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white font-medium",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <User className="size-4 mr-2" />
                            Sign in as Guest
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-zinc-500 mt-6">
                        By continuing, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
}
