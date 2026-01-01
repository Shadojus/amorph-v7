/**
 * Structured Logger - Production-ready logging
 * Supports levels, timestamps, context, and JSON output
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  request?: {
    method: string;
    url: string;
    ip: string;
    userAgent?: string;
  };
  duration?: number;
}

interface LoggerConfig {
  level: LogLevel;
  json: boolean;           // Output as JSON (for production)
  includeTimestamp: boolean;
  includeStack: boolean;   // Include stack traces
  contextPrefix?: string;  // e.g., "AMORPH"
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

const defaultConfig: LoggerConfig = {
  level: (import.meta.env.DEV ? 'debug' : 'info') as LogLevel,
  json: !import.meta.env.DEV,
  includeTimestamp: true,
  includeStack: import.meta.env.DEV,
  contextPrefix: 'AMORPH'
};

class Logger {
  private config: LoggerConfig;
  private context: Record<string, unknown> = {};

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const child = new Logger(this.config);
    child.context = { ...this.context, ...context };
    return child;
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * Format and output log entry
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...data }
    };

    if (this.config.json) {
      // JSON output for production log aggregation
      console.log(JSON.stringify(entry));
    } else {
      // Pretty output for development
      const prefix = this.config.contextPrefix ? `[${this.config.contextPrefix}]` : '';
      const timestamp = this.config.includeTimestamp 
        ? `[${entry.timestamp}]` 
        : '';
      const levelBadge = `[${level.toUpperCase()}]`;
      
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m',  // Cyan
        info: '\x1b[32m',   // Green
        warn: '\x1b[33m',   // Yellow
        error: '\x1b[31m',  // Red
        fatal: '\x1b[35m'   // Magenta
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${colors[level]}${timestamp}${prefix}${levelBadge}${reset} ${message}`,
        Object.keys(entry.context || {}).length > 0 ? entry.context : ''
      );
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: this.config.includeStack ? error.stack : undefined
      }
    } : {};
    
    this.log('error', message, { ...errorData, ...data });
  }

  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : {};
    
    this.log('fatal', message, { ...errorData, ...data });
  }

  /**
   * Log HTTP request
   */
  request(request: Request, status: number, duration: number): void {
    const url = new URL(request.url);
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    
    this.log(level, `${request.method} ${url.pathname} ${status}`, {
      request: {
        method: request.method,
        url: url.pathname,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      },
      duration,
      status
    });
  }

  /**
   * Create request timer
   */
  startRequest(request: Request): () => void {
    const start = Date.now();
    return () => Date.now() - start;
  }
}

// Export singleton logger
export const logger = new Logger();

// Export for creating scoped loggers
export function createLogger(context: string): Logger {
  return logger.child({ scope: context });
}

// Request logging middleware helper
export function logRequest(request: Request): { end: (status: number) => void } {
  const start = Date.now();
  const url = new URL(request.url);
  
  logger.debug(`→ ${request.method} ${url.pathname}`);
  
  return {
    end: (status: number) => {
      const duration = Date.now() - start;
      logger.request(request, status, duration);
    }
  };
}

export { Logger };
export type { LogEntry, LoggerConfig };
