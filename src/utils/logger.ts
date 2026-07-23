import winston from "winston";
import { config } from "@/config";

const { combine, timestamp, printf, colorize } = winston.format;

const TAG_WIDTH = 14;

const logFormat = printf(({ level, message, timestamp, tag }) => {
  const tagStr = tag
    ? ` [${String(tag).padEnd(TAG_WIDTH)}]`
    : " ".repeat(TAG_WIDTH + 3);
  return `${timestamp} ${level.padEnd(5)}${tagStr}  ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(
    timestamp({ format: "HH:mm:ss" }),
    logFormat,
    colorize({ all: true }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
  ],
});

export function getLogger(tag: string): winston.Logger {
  return logger.child({ tag });
}

export const versionTag =
  process.env.NODE_ENV === "dev"
    ? `v${config.version}_dev`
    : `v${config.version}`;

const debugTag = process.env.LOG_LEVEL === "debug" ? " [debug mode]" : "";

export function printBanner(): void {
  console.log(`
  ██╗  ██╗   ██╗██████╗  █████╗ 
  ██║  ╚██╗ ██╔╝██╔══██╗██╔══██╗
  ██║   ╚████╔╝ ██████╔╝███████║
  ██║    ╚██╔╝  ██╔══██╗██╔══██║
  ███████╗██║   ██║  ██║██║  ██║
  ╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
                        ${versionTag}${debugTag}
  `);
}