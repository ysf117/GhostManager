/**
 * Database Types
 * 
 * TypeScript interfaces matching the Prisma schema.
 * These types mirror the database models for use throughout the application.
 * Reference: docs/architecture.md Section 3
 */

// ============================================
// ENUMS
// ============================================

/**
 * Supported currencies for subscription costs
 */
export enum Currency {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
}

/**
 * Billing cycle options for subscriptions
 */
export enum BillingCycle {
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

/**
 * Status of a subscription
 */
export enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
}

// ============================================
// INTERFACES
// ============================================

/**
 * User interface matching the Prisma User model
 */
export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    default_currency: string;
    show_monthly_costs: boolean;
    budget_limit: number;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * User with related subscriptions
 */
export interface UserWithSubscriptions extends User {
    subscriptions: Subscription[];
}

/**
 * Subscription interface matching the Prisma Subscription model
 */
export interface Subscription {
    id: string;
    user_id: string;
    service_name: string;
    cost: number;
    currency: Currency;
    billing_cycle: BillingCycle;
    start_date: Date;
    next_billing_date: Date;
    status: SubscriptionStatus;
    category: string;
    is_trial: boolean;
    trial_end_date: Date | null;
    reminder_days: number | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Subscription with related user
 */
export interface SubscriptionWithUser extends Subscription {
    user: User;
}

// ============================================
// INPUT TYPES (for forms and mutations)
// ============================================

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
    email: string;
    name?: string;
    avatar_url?: string;
}

/**
 * Input for updating a user
 */
export interface UpdateUserInput {
    email?: string;
    name?: string | null;
    avatar_url?: string | null;
    default_currency?: string;
}

/**
 * Input for creating a new subscription
 */
export interface CreateSubscriptionInput {
    user_id: string;
    service_name: string;
    cost: number;
    currency?: Currency;
    billing_cycle?: BillingCycle;
    start_date: Date;
    status?: SubscriptionStatus;
}

/**
 * Input for updating a subscription
 */
export interface UpdateSubscriptionInput {
    service_name?: string;
    cost?: number;
    currency?: Currency;
    billing_cycle?: BillingCycle;
    start_date?: Date;
    status?: SubscriptionStatus;
}
