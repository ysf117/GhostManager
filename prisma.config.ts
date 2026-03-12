// Prisma Configuration for Ghost Manager
// =======================================
// This file configures Prisma CLI behavior including migrations and schema location.

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Schema file location
  schema: "prisma/schema.prisma",

  // Migrations directory
  migrations: {
    path: "prisma/migrations",
    seed: "npx -y tsx prisma/seed.ts",
  },

  // Database connection for migrations
  // Uses DIRECT_URL for migrations (bypasses connection pooling)
  // Falls back to DATABASE_URL if DIRECT_URL is not set
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
