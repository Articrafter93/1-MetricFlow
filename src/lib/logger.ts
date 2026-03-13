import pino from "pino";

type LogMetadata = Record<string, unknown>;

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    bindings: () => ({}),
  },
});

export const appLogger = {
  info(message: string, metadata?: LogMetadata) {
    logger.info(metadata ?? {}, message);
  },
  warn(message: string, metadata?: LogMetadata) {
    logger.warn(metadata ?? {}, message);
  },
  error(message: string, metadata?: LogMetadata) {
    logger.error(metadata ?? {}, message);
  },
};
