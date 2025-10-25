import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

// Load env from root folder
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Singleton Prisma client
declare global {
  // allow global `prisma` in dev to prevent multiple instances
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Only connect once in dev
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  prisma.$connect();
}

export { prisma };
