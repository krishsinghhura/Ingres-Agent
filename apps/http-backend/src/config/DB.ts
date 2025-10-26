import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

//taking the envs from global env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

//singleton client
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  prisma.$connect();
}

export { prisma };
