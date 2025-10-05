// Comprehensive logging system for ChordLine app

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  orgId?: string;
  sessionId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private sessionId: string;
  private enabledCategories: Set<string>;

  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.sessionId = this.generateSessionId();
    this.enabledCategories = new Set([
      'auth',
      'navigation',
      'data',
      'ui',
      'performance',
      'error',
      'api',
      'db',
      'cache',
    ]);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, category: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].padEnd(5);
    const sessionId = context?.sessionId || this.sessionId;
    
    let formatted = `[${timestamp}] [${levelStr}] [${category.toUpperCase()}] ${message}`;
    
    if (context) {
      const { component, action, userId, orgId } = context;
      const contextParts = [];
      
      if (component) contextParts.push(`component:${component}`);
      if (action) contextParts.push(`action:${action}`);
      if (userId) contextParts.push(`user:${userId.slice(0, 8)}...`);
      if (orgId) contextParts.push(`org:${orgId.slice(0, 8)}...`);
      
      if (contextParts.length > 0) {
        formatted += ` | ${contextParts.join(' | ')}`;
      }
    }
    
    return formatted;
  }

  private log(level: LogLevel, category: string, message: string, context?: LogContext, data?: unknown): void {
    if (!this.shouldLog(level) || !this.enabledCategories.has(category)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, category, message, context);
    const logMethod = level >= LogLevel.ERROR ? console.error : 
                     level >= LogLevel.WARN ? console.warn : 
                     level >= LogLevel.INFO ? console.info : console.debug;

    if (data !== undefined) {
      logMethod(formattedMessage, data);
    } else {
      logMethod(formattedMessage);
    }

    // In production, you might want to send logs to an external service
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.ERROR) {
      this.sendToLogService(level, category, message, context, data);
    }
  }

  private sendToLogService(level: LogLevel, category: string, message: string, context?: LogContext, data?: unknown): void {
    // Implementation for external logging service (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for production logging
    const logEntry = {
      level: LogLevel[level],
      category,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Example: Send to external service
    // fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
  }

  // Public API methods
  debug(category: string, message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.DEBUG, category, message, context, data);
  }

  info(category: string, message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.INFO, category, message, context, data);
  }

  warn(category: string, message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.WARN, category, message, context, data);
  }

  error(category: string, message: string, context?: LogContext, data?: unknown): void {
    this.log(LogLevel.ERROR, category, message, context, data);
  }

  // Specialized logging methods
  auth(message: string, context?: LogContext, data?: unknown): void {
    this.info('auth', message, context, data);
  }

  navigation(message: string, context?: LogContext, data?: unknown): void {
    this.debug('navigation', message, context, data);
  }

  dataOperation(message: string, context?: LogContext, data?: unknown): void {
    this.debug('data', message, context, data);
  }

  apiCall(message: string, context?: LogContext, data?: unknown): void {
    this.debug('api', message, context, data);
  }

  performance(message: string, context?: LogContext, data?: unknown): void {
    this.info('performance', message, context, data);
  }

  userAction(action: string, component: string, data?: unknown): void {
    this.info('ui', `User action: ${action}`, { component, action }, data);
  }

  cacheOperation(message: string, context?: LogContext, data?: unknown): void {
    this.debug('cache', message, context, data);
  }

  // Performance timing utilities
  startTimer(label: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.performance(`Timer [${label}] completed in ${duration.toFixed(2)}ms`);
      return duration;
    };
  }

  // Error boundary integration
  logReactError(error: Error, errorInfo: React.ErrorInfo): void {
    this.error('error', 'React error boundary caught error', {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
    }, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  // Network request logging
  logApiRequest(method: string, url: string, context?: LogContext): void {
    this.apiCall(`${method.toUpperCase()} ${url}`, {
      ...context,
      action: 'apiRequest',
    });
  }

  logApiResponse(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'debug';
    this[level as 'error' | 'warn' | 'debug']('api', 
      `${method.toUpperCase()} ${url} ${status} (${duration}ms)`, 
      { ...context, action: 'apiResponse' }
    );
  }

  // Feature flag logging
  featureFlag(flag: string, value: boolean, context?: LogContext): void {
    this.debug('feature', `Feature flag ${flag}: ${value}`, context);
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.level = level;
    this.info('logger', `Log level set to ${LogLevel[level]}`);
  }

  // Enable/disable categories
  enableCategory(category: string): void {
    this.enabledCategories.add(category);
    this.debug('logger', `Enabled logging category: ${category}`);
  }

  disableCategory(category: string): void {
    this.enabledCategories.delete(category);
    this.debug('logger', `Disabled logging category: ${category}`);
  }

  // Get session info
  getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
export const logger = new Logger();

// React hook for component logging
export const useLogger = (componentName: string) => {
  return {
    debug: (message: string, data?: unknown) => 
      logger.debug('ui', message, { component: componentName }, data),
    info: (message: string, data?: unknown) => 
      logger.info('ui', message, { component: componentName }, data),
    warn: (message: string, data?: unknown) => 
      logger.warn('ui', message, { component: componentName }, data),
    error: (message: string, data?: unknown) => 
      logger.error('ui', message, { component: componentName }, data),
    userAction: (action: string, data?: unknown) => 
      logger.userAction(action, componentName, data),
    startTimer: (label: string) => logger.startTimer(`${componentName}:${label}`),
  };
};

// Performance monitoring integration
export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const endTimer = logger.startTimer(name);
    try {
      const result = fn(...args);
      if (result && typeof result.then === 'function') {
        // Handle async functions
        return result.finally(() => endTimer());
      } else {
        endTimer();
        return result;
      }
    } catch (error) {
      endTimer();
      logger.error('performance', `Error in ${name}`, {}, error);
      throw error;
    }
  }) as T;
};

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logger.error('error', 'Unhandled JavaScript error', {
      action: 'globalErrorHandler',
    }, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('error', 'Unhandled promise rejection', {
      action: 'globalRejectionHandler',
    }, {
      reason: event.reason,
    });
  });
}

export default logger;