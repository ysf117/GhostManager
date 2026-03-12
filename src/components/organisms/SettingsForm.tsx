"use client";

/**
 * SettingsForm Organism
 *
 * Client component for the settings form with useActionState.
 */

import { useActionState, useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { updateSettings, type SettingsResult } from "@/actions/update-settings";
import { uploadAvatar } from "@/actions/upload-avatar";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/molecules/Card";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
    initialName: string;
    initialEmail: string;
    initialCurrency: string;
    initialShowMonthlyCosts: boolean;
    initialAvatarUrl?: string | null;
    initialBudgetLimit: number;
}

const initialState: SettingsResult = {
    success: false,
    message: "",
};

export function SettingsForm({
    initialName,
    initialEmail,
    initialCurrency,
    initialShowMonthlyCosts,
    initialAvatarUrl,
    initialBudgetLimit,
}: SettingsFormProps) {
    const [state, formAction, isPending] = useActionState(updateSettings, initialState);
    const [currency, setCurrency] = useState(initialCurrency);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showMonthlyEquivalent, setShowMonthlyEquivalent] = useState(initialShowMonthlyCosts);

    // Avatar upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || null);
    const [isUploading, startUpload] = useTransition();
    const [avatarMessage, setAvatarMessage] = useState<{ success: boolean; text: string } | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        startUpload(async () => {
            setAvatarMessage(null);
            const result = await uploadAvatar(formData);
            if (result.success && result.avatarUrl) {
                setAvatarUrl(result.avatarUrl);
                setAvatarMessage({ success: true, text: result.message });
            } else {
                setAvatarMessage({ success: false, text: result.message });
            }
        });

        // Reset file input so the same file can be re-selected
        e.target.value = "";
    };

    // Avatar display source
    const avatarSrc = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(initialEmail)}`;

    // Handle hydration mismatch for theme
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Card variant="glass" className="border-border">
            <CardHeader>
                <CardTitle className="text-foreground">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Success Message */}
                {state.success && state.message && (
                    <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        {state.message}
                    </div>
                )}

                {/* Error Message */}
                {!state.success && state.message && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                        {state.message}
                    </div>
                )}

                {/* Section 1: Profile Details */}
                <h3 className="text-lg font-medium text-foreground mb-4">Profile Details</h3>

                {/* Profile Photo */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                        Profile Photo
                    </label>
                    <div className="flex items-center gap-5">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="relative group"
                        >
                            <div className="size-20 rounded-full overflow-hidden border-2 border-border bg-muted">
                                <Image
                                    src={avatarSrc}
                                    alt="Profile photo"
                                    className="w-full h-full object-cover"
                                    width={80}
                                    height={80}
                                    unoptimized
                                />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white text-xl">
                                    photo_camera
                                </span>
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-xl animate-spin">
                                        progress_activity
                                    </span>
                                </div>
                            )}
                        </button>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Change Photo"}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                JPG, PNG, WebP, or GIF. Max 5MB.
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    {avatarMessage && (
                        <div className={cn(
                            "mt-3 p-2 rounded-lg text-sm",
                            avatarMessage.success
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                        )}>
                            {avatarMessage.text}
                        </div>
                    )}
                </div>

                <form action={formAction} className="space-y-6">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                            Display Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            defaultValue={initialName}
                            disabled={isPending}
                            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-[#3d40f0]/50 focus:ring-[#3d40f0]/20"
                        />
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={initialEmail}
                            disabled
                            className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Separator */}
                    <div className="my-8 h-px bg-white/10" />

                    {/* Section 2: App Preferences */}
                    <h3 className="text-lg font-medium text-foreground mb-4">App Preferences</h3>

                    {/* Default Currency */}
                    <div className="space-y-2">
                        <label htmlFor="default_currency" className="text-sm font-medium text-muted-foreground">
                            Default Currency
                        </label>
                        <input type="hidden" name="default_currency" value={currency} />
                        <Select
                            value={currency}
                            onValueChange={setCurrency}
                            disabled={isPending}
                        >
                            <SelectTrigger className="bg-muted border-border text-foreground">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-foreground">
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            This will be used as the default display currency
                        </p>
                    </div>

                    {/* Monthly Budget Limit */}
                    <div className="space-y-2">
                        <label htmlFor="budget_limit" className="text-sm font-medium text-muted-foreground">
                            Monthly Budget Limit
                        </label>
                        <Input
                            id="budget_limit"
                            name="budget_limit"
                            type="number"
                            min="0"
                            step="any"
                            defaultValue={initialBudgetLimit}
                            disabled={isPending}
                            className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-[#3d40f0]/50 focus:ring-[#3d40f0]/20"
                        />
                        <p className="text-xs text-muted-foreground">
                            Set your monthly spending limit for the budget widget
                        </p>
                    </div>

                    {/* Theme Preference */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Theme Preference
                        </label>
                        {mounted ? (
                            <Select
                                value={theme}
                                onValueChange={setTheme}
                            >
                                <SelectTrigger className="bg-muted border-border text-foreground">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover border-border text-foreground">
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-10 bg-muted border border-border rounded-md animate-pulse" />
                        )}
                        <p className="text-xs text-muted-foreground">
                            Choose your preferred color theme
                        </p>
                    </div>

                    {/* Billing View Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Billing View
                        </label>
                        <input type="hidden" name="show_monthly_costs" value={showMonthlyEquivalent ? "true" : "false"} />
                        <div className="flex items-center justify-between p-3 bg-muted border border-border rounded-md">
                            <div>
                                <p className="text-sm text-foreground">Show Monthly Equivalent</p>
                                <p className="text-xs text-muted-foreground">
                                    Display yearly costs as monthly amounts
                                </p>
                            </div>
                            <Switch
                                checked={showMonthlyEquivalent}
                                onCheckedChange={setShowMonthlyEquivalent}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "bg-[#3d40f0] hover:bg-[#3d40f0]/90 text-white font-bold",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-sm">
                                        progress_activity
                                    </span>
                                    Saving...
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
