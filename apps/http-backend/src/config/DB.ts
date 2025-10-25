import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") {
  if (!(global as any).prisma) {
    (global as any).prisma = prisma;
  }
  prisma.$connect();
}

export default (global as any).prisma || prisma;
