import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const shouldInitPrisma = Boolean(process.env.DATABASE_URL);

const prismaClient = shouldInitPrisma
  ? global.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  : undefined;

export const prisma = prismaClient as PrismaClient;

if (process.env.NODE_ENV !== "production" && prismaClient) {
  global.prisma = prismaClient;
}
