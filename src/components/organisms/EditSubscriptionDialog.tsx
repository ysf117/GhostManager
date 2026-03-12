"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Pencil, Trash2 } from "lucide-react";

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
import { Switch } from "@/components/atoms/switch";
import { cn } from "@/lib/utils";
import { Subscription } from "@/types/database";
import { updateSubscription } from "@/actions/update-subscription";

const formSchema = z.object({
    service_name: z.string().min(1, "Service name is required"),
    cost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Cost must be a positive number",
    }),
    currency: z.enum(["USD", "EUR", "GBP"]),
    billing_cycle: z.enum(["MONTHLY", "YEARLY"]),
    status: z.enum(["ACTIVE", "PAUSED"]),
    start_date: z.date().optional(),
    category: z.string(),
    is_trial: z.boolean(),
    trial_end_date: z.date().optional().nullable(),
    next_billing_date: z.date().optional().nullable(),
    reminder_days: z.string().optional(),
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

interface EditSubscriptionDialogProps {
    subscription: Subscription;
}

export function EditSubscriptionDialog({ subscription }: EditSubscriptionDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            service_name: subscription.service_name,
            cost: String(subscription.cost),
            currency: subscription.currency,
            billing_cycle: subscription.billing_cycle,
            status: subscription.status,
            start_date: new Date(subscription.start_date),
            category: subscription.category || "Other",
            is_trial: subscription.is_trial || false,
            trial_end_date: subscription.trial_end_date ? new Date(subscription.trial_end_date) : undefined,
            next_billing_date: subscription.next_billing_date ? new Date(subscription.next_billing_date) : undefined,
            reminder_days: subscription.reminder_days ? String(subscription.reminder_days) : "null",
        },
    });

    // Reset form when valid subscription changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                service_name: subscription.service_name,
                cost: String(subscription.cost),
                currency: subscription.currency,
                billing_cycle: subscription.billing_cycle,
                status: subscription.status,
                start_date: new Date(subscription.start_date),
                category: subscription.category || "Other",
                is_trial: subscription.is_trial || false,
                trial_end_date: subscription.trial_end_date ? new Date(subscription.trial_end_date) : undefined,
                next_billing_date: subscription.next_billing_date ? new Date(subscription.next_billing_date) : undefined,
                reminder_days: subscription.reminder_days ? String(subscription.reminder_days) : "null",
            });
        }
    }, [open, subscription, form]);

    const isTrial = form.watch("is_trial");

    function onSubmit(values: FormValues) {
        startTransition(async () => {
            const formData = new FormData();
            formData.append("id", subscription.id);
            formData.append("service_name", values.service_name);
            formData.append("cost", values.cost);
            formData.append("currency", values.currency);
            formData.append("billing_cycle", values.billing_cycle);
            formData.append("status", values.status);
            formData.append("category", values.category);
            formData.append("is_trial", values.is_trial ? "true" : "false");

            // Dates
            const startDate = values.start_date || new Date();
            formData.append("start_date", startDate.toISOString());

            if (values.trial_end_date) {
                formData.append("trial_end_date", values.trial_end_date.toISOString());
            }
            if (values.next_billing_date) {
                formData.append("next_billing_date", values.next_billing_date.toISOString());
            }

            // Reminder
            if (values.reminder_days && values.reminder_days !== "null") {
                formData.append("reminder_days", values.reminder_days);
            } else {
                formData.append("reminder_days", "null");
            }

            const result = await updateSubscription(formData);

            if (result.success) {
                setOpen(false);
            } else {
                form.setError("root", { message: result.message });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="p-2 rounded-lg hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 transition-colors"
                    title="Edit subscription"
                >
                    <Pencil className="size-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1b2e] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Edit Subscription</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Update subscription details.
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
                                        <FormLabel className="text-white">Service Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Netflix..." {...field} className="bg-black/20 border-white/10 text-white" />
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
                                        <FormLabel className="text-white">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
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
                                        <FormLabel className="text-white">Cost</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} className="bg-black/20 border-white/10 text-white" />
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
                                        <FormLabel className="text-white">Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
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

                        {/* Billing Cycle & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="billing_cycle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Cycle</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                <SelectItem value="YEARLY">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="PAUSED">Paused</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Trial Toggle */}
                        <FormField
                            control={form.control}
                            name="is_trial"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-3 bg-black/20">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-white">Free Trial</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {isTrial ? (
                                <FormField
                                    control={form.control}
                                    name="trial_end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-white">Trial End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white", !field.value && "text-muted-foreground")}>
                                                            {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-[#1a1b2e] border-white/10 text-white" align="start">
                                                    <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus className="bg-[#1a1b2e] text-white"
                                                        classNames={{ day_selected: "bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90", day_today: "bg-white/10 text-white", day: "hover:bg-white/5" }} />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-white">Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white", !field.value && "text-muted-foreground")}>
                                                                {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-[#1a1b2e] border-white/10 text-white" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus className="bg-[#1a1b2e] text-white"
                                                            classNames={{ day_selected: "bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90", day_today: "bg-white/10 text-white", day: "hover:bg-white/5" }} />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="next_billing_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-white">Next Billing</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white", !field.value && "text-muted-foreground")}>
                                                                {field.value ? format(field.value, "PPP") : <span>Pick date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 bg-[#1a1b2e] border-white/10 text-white" align="start">
                                                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus className="bg-[#1a1b2e] text-white"
                                                            classNames={{ day_selected: "bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90", day_today: "bg-white/10 text-white", day: "hover:bg-white/5" }} />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>

                        {/* Reminder */}
                        <FormField
                            control={form.control}
                            name="reminder_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white">Remind Me</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                <SelectValue placeholder="Select reminder" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#1a1b2e] border-white/10 text-white">
                                            <SelectItem value="null">No Reminder</SelectItem>
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
                            <Button type="submit" disabled={isPending} className="bg-[#3d40f0] text-white hover:bg-[#3d40f0]/90 w-full sm:w-auto">
                                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
export default EditSubscriptionDialog;
