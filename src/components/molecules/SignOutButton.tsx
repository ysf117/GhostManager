/**
 * SignOutButton Component
 * 
 * A button that signs out the current user.
 * Uses Server Action for the signout logic.
 */

"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signout } from "@/actions/auth";
import { Button } from "@/components/atoms/button";

export function SignOutButton() {
    const [isPending, startTransition] = useTransition();

    const handleSignOut = () => {
        startTransition(async () => {
            await signout();
        });
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            disabled={isPending}
            className="rounded-xl hover:text-red-500 hover:border-red-500/30"
            title="Sign out"
        >
            {isPending ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            ) : (
                <LogOut className="size-5" />
            )}
        </Button>
    );
}
