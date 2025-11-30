// Structured logging utility

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogMetadata {
  [key: string]: any
}

class Logger {
  private minLevel: LogLevel

  constructor() {
    this.minLevel = this.getMinLogLevel()
  }

  private getMinLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase() || "INFO"
    return LogLevel[level as keyof typeof LogLevel] || LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): string {
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    
    const logObject = {
      timestamp,
      level: levelName,
      message,
      ...metadata,
    }

    return JSON.stringify(logObject)
  }

  debug(message: string, metadata?: LogMetadata) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, metadata))
    }
  }

  info(message: string, metadata?: LogMetadata) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, metadata))
    }
  }

  warn(message: string, metadata?: LogMetadata) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, metadata))
    }
  }

  error(message: string, error?: Error, metadata?: LogMetadata) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMetadata = error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            ...metadata,
          }
        : metadata

      console.error(this.formatMessage(LogLevel.ERROR, message, errorMetadata))
    }
  }

  fatal(message: string, error?: Error, metadata?: LogMetadata) {
    if (this.shouldLog(LogLevel.FATAL)) {
      const errorMetadata = error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            ...metadata,
          }
        : metadata

      console.error(this.formatMessage(LogLevel.FATAL, message, errorMetadata))
    }
  }

  // API request logging
  request(req: {
    method: string
    url: string
    headers?: any
    body?: any
  }) {
    this.info("API Request", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    })
  }

  // API response logging
  response(res: {
    status: number
    statusText?: string
    duration?: number
  }) {
    const level = res.status >= 500 ? LogLevel.ERROR : LogLevel.INFO
    this.info("API Response", {
      status: res.status,
      statusText: res.statusText,
      duration: res.duration,
    })
  }

  // Database query logging
  query(query: string, duration?: number) {
    this.debug("Database Query", {
      query,
      duration,
    })
  }

  // Performance logging
  performance(operation: string, duration: number, metadata?: LogMetadata) {
    this.info("Performance", {
      operation,
      duration,
      ...metadata,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Performance measurement helper
export function measurePerformance<T>(
  operation: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = Date.now()
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result.then((value) => {
        const duration = Date.now() - start
        logger.performance(operation, duration)
        return value
      }).catch((error) => {
        const duration = Date.now() - start
        logger.error(`${operation} failed`, error, { duration })
        throw error
      })
    }
    
    const duration = Date.now() - start
    logger.performance(operation, duration)
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`${operation} failed`, error as Error, { duration })
    throw error
  }
}

