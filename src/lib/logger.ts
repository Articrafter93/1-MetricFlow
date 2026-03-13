type LogLevel = "info" | "warn" | "error";

function emit(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

export const appLogger = {
  info(message: string, metadata?: Record<string, unknown>) {
    emit("info", message, metadata);
  },
  warn(message: string, metadata?: Record<string, unknown>) {
    emit("warn", message, metadata);
  },
  error(message: string, metadata?: Record<string, unknown>) {
    emit("error", message, metadata);
  },
};

