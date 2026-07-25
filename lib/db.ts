import { PrismaClient } from "@/app/generated/prisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
