import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("error", (e) => {
  logger.error(`Prisma error: ${e.message}`);
});

prisma.$on("warn", (e) => {
  logger.warn(`Prisma warning: ${e.message}`);
});

export default prisma;