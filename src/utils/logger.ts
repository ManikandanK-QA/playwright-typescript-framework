import { env } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/**
 * Minimal structured logger.
 *
 * Deliberately dependency-free: it writes one line per event with an ISO
 * timestamp, level, scope and optional JSON context. Scopes make it easy to
 * follow a single API call (`qa.api`) or page interaction in CI logs.
 */
export class Logger {
  constructor(
    private readonly scope: string,
    private readonly minimum: LogLevel = 'info',
  ) {}

  child(scope: string): Logger {
    return new Logger(`${this.scope}.${scope}`, this.minimum);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write('error', message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (ORDER[level] < ORDER[this.minimum]) {
      return;
    }

    const suffix = context && Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : '';
    const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${this.scope}] ${message}${suffix}`;

    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}

export const logger = new Logger('qa', env.LOG_LEVEL);
