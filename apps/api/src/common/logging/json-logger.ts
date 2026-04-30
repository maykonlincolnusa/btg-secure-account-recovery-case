import { LoggerService } from "@nestjs/common";
import { redactSensitive } from "@secure-recovery/utils";

type Level = "log" | "error" | "warn" | "debug" | "verbose";

export class JsonLogger implements LoggerService {
  log(message: unknown, context?: string) {
    this.write("log", message, context);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write("error", { message, trace }, context);
  }

  warn(message: unknown, context?: string) {
    this.write("warn", message, context);
  }

  debug(message: unknown, context?: string) {
    this.write("debug", message, context);
  }

  verbose(message: unknown, context?: string) {
    this.write("verbose", message, context);
  }

  private write(level: Level, message: unknown, context?: string) {
    const event = {
      ts: new Date().toISOString(),
      level,
      context,
      message: redactSensitive(message)
    };
    const line = JSON.stringify(event);
    if (level === "error") {
      process.stderr.write(`${line}\n`);
      return;
    }
    process.stdout.write(`${line}\n`);
  }
}
