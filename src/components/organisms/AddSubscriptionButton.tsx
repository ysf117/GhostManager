"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Switch } from "@/components/atoms/switch";

import { Button } from "@/components/atoms/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/atoms/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/atoms/form";
import { Input } from "@/components/atoms/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/atoms/popover";
import { Calendar } from "@/components/atoms/calendar";
import { cn } from "@/lib/utils";
import { createSubscription } from "@/actions/create-subscription";

// Schema for the form - defaults are set in useForm's defaultValues, not here
const formSchema = z.object({
    service_name: z.string().min(1, "Service name is required"),
    cost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Cost must be a positive number",
    }),
    currency: z.enum(["USD", "EUR", "GBP"]),
    billing_cycle: z.enum(["MONTHLY", "YEARLY"]),
    start_date: z.date().optional(),
    // New fields
    category: z.string(),
    is_trial: z.boolean(),
    trial_end_date: z.date().optional().nullable(),
    reminder_days: z.string().optional(), // Using string for Select value, will parse to int
}).superRefine((data, ctx) => {
    if (!data.is_trial && !data.start_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required",
            path: ["start_date"],
        });
    }
    if (data.is_trial && !data.trial_end_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Trial end date is required",
            path: ["trial_end_date"],
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

interface AddSubscriptionButtonProps {
    /** When true, renders as a mobile FAB (Floating Action Button) */
    mobile?: boolean;
}

export function AddSubscriptionButton({ mobile = false }: AddSubscriptionButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch for Radix UI components
    useEffect(() => {
        setMounted(true);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            service_name: "",
            cost: "",
            currency: "USD",
            billing_cycle: "MONTHLY",
            start_date: new Date(),
            category: "Other",
            is_trial: false,
            trial_end_date: undefined,
            reminder_days: "no_reminder", // Default value for select
        },
    });

    const isTrial = form.watch("is_trial");

    // Show static button during SSR/hydration to avoid ID mismatches
    if (!mounted) {
        if (mobile) {
            return (
                <button className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] md:hidden">
                    <span className="material-symbols-outlined text-white text-2xl">add</span>
                </button>
            );
        }
        return (
            <Button size="sm" className="hidden md:flex items-center gap-2">
                New Subscription
                <span className="material-symbols-outlined text-sm font-bold">add</span>
            </Button>
        );
    }

    function onSubmit(values: FormValues) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("service_name", values.service_name);
            formData.append("cost", values.cost); // Already string, server action handles parsing if needed or we parse here
            formData.append("currency", values.currency);
            formData.append("billing_cycle", values.billing_cycle);

            // Handle start date (required for non-trials, defaults to now for trials)
            const startDate = values.start_date || new Date();
            formData.append("start_date", startDate.toISOString());

            // Append new fields
            formData.append("category", values.category);
            formData.append("is_trial", values.is_trial ? "true" : "false");
            if (values.trial_end_date) {
                formData.append("trial_end_date", values.trial_end_date.toISOString());
            }
            if (values.reminder_days && values.reminder_days !== "no_reminder") {
                formData.append("reminder_days", values.reminder_days);
            } else {
                formData.append("reminder_days", "null");
            }

            const result = await createSubscription(formData);

            if (result.success) {
                setOpen(false);
                form.reset();
                // Ideally use toast here, but for now simple check
                console.log("Subscription created:", result.message);
            } else {
                console.error("Failed to create subscription:", result.message);
                // Could set form error here if needed
                form.setError("root", { message: result.message });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mobile ? (
                    <button className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] md:hidden active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-white text-2xl">add</span>
                    </button>
                ) : (
                    <Button size="sm" className="hidden md:flex items-center gap-2">
                        New Subscription
                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-popover text-foreground border-border">
                <DialogHeader>
                    <DialogTitle>Add Subscription</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add a new subscription to track your recurring expenses.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Service Name */}
                            <FormField
                                control={form.control}
                                name="service_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Service Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Netflix, Spotify..."
                                                {...field}
                                                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-muted border-border text-foreground">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border text-foreground">
                                                <SelectItem value="Entertainment">Entertainment</SelectItem>
                                                <SelectItem value="Software">Software</SelectItem>
                                                <SelectItem value="Utilities">Utilities</SelectItem>
                                                <SelectItem value="Food">Food</SelectItem>
                                                <SelectItem value="Health">Health</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Cost & Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Cost</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground">Currency</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-muted border-border text-foreground">
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-popover border-border text-foreground">
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                                <SelectItem value="GBP">GBP (£)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Billing Cycle */}
                        <FormField
                            control={form.control}
                            name="billing_cycle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Billing Cycle</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-muted border-border text-foreground">
                                                <SelectValue placeholder="Select cycle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border-border text-foreground">
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                            <SelectItem value="YEARLY">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Trial Toggle */}
                        <FormField
                            control={form.control}
                            name="is_trial"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-muted">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-foreground">Free Trial</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Date Selection (Conditional) */}
                        {isTrial ? (
                            <FormField
                                control={form.control}
                                name="trial_end_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-foreground">Trial End Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-muted border-border text-foreground hover:bg-accent hover:text-foreground",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-popover border-border text-foreground" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                    className="bg-popover text-foreground"
                                                    classNames={{
                                                        day_selected: "bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90",
                                                        day_today: "bg-accent text-foreground",
                                                        day: "hover:bg-accent",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-foreground">Start Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal bg-muted border-border text-foreground hover:bg-accent hover:text-foreground",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-popover border-border text-foreground" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="bg-popover text-foreground"
                                                    classNames={{
                                                        day_selected: "bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90",
                                                        day_today: "bg-accent text-foreground",
                                                        day: "hover:bg-accent",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Reminder Selection */}
                        <FormField
                            control={form.control}
                            name="reminder_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Remind Me</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-muted border-border text-foreground">
                                                <SelectValue placeholder="Select reminder" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border-border text-foreground">
                                            <SelectItem value="no_reminder">No Reminder</SelectItem>
                                            <SelectItem value="1">1 day before</SelectItem>
                                            <SelectItem value="3">3 days before</SelectItem>
                                            <SelectItem value="7">1 week before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
                        )}

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90 w-full sm:w-auto"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Subscription"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
