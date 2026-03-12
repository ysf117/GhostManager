/**
 * Prisma Client Singleton
 * 
 * This module provides a singleton instance of the Prisma Client.
 * In development, it prevents creating multiple instances due to hot reloading.
 * 
 * Prisma 7.x Configuration:
 * - Uses @prisma/adapter-pg for PostgreSQL connections
 * - DATABASE_URL (pooled connection) for runtime queries
 * - Migrations use DIRECT_URL configured in prisma.config.ts
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Create the PostgreSQL adapter with the pooled connection URL
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

// Global reference to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Prisma client singleton instance
 * 
 * Uses the pooled DATABASE_URL from environment for optimal performance.
 * 
 * Usage:
 * ```ts
 * import { prisma } from "@/lib/prisma";
 * const users = await prisma.user.findMany();
 * ```
 */
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
