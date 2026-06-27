import winston from "winston";
import { config } from "../config";

const { combine, timestamp, colorize, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}]: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error"
    }),
    new winston.transports.File({
      filename: "logs/combined.log"
    }),
  ],
});

export const versionTag = process.env.NODE_ENV === "dev" ? `v${config.version}_dev` : `v${config.version}`;
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