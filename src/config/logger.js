// utils/logger.js
import { createLogger, transports, format } from "winston";

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: format.combine(
    format.timestamp(),
    isDev ? format.colorize() : format.uncolorize(),
    isDev ? format.simple() : format.json()
  ),
  transports: [
    // ✅ Console
    new transports.Console({
      handleExceptions: true,
    }),

    // ✅ Logs séparés
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: "logs/combined.log",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exitOnError: false,
});

export default logger;
