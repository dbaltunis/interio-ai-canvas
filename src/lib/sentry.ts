import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error monitoring
 * Call this once at app startup before rendering
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    if (import.meta.env.MODE === 'production') {
      console.warn('[Sentry] No DSN configured - error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.MODE === 'production',
    
    // Performance monitoring - sample 10% of transactions
    tracesSampleRate: 0.1,
    
    // Only capture errors from your domain
    allowUrls: [
      /interioapp-ai\.lovable\.app/,
      /localhost/,
    ],
    
    // Ignore common non-actionable errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      /Loading chunk .* failed/,
      /ChunkLoadError/,
      'Network request failed',
      'AbortError',
      'cancelled',
    ],
    
    // Scrub sensitive data before sending
    beforeSend(event) {
      // Remove tokens from URLs
      if (event.request?.url) {
        event.request.url = event.request.url
          .replace(/token=[^&]+/g, 'token=[REDACTED]')
          .replace(/apikey=[^&]+/gi, 'apikey=[REDACTED]');
      }
      
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      
      return event;
    },
  });
};

/**
 * Set user context for error tracking
 * Call when user signs in/out
 */
export const setSentryUser = (user: { id: string; email?: string; role?: string } | null) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add contextual information to all subsequent errors
 */
export const setSentryContext = (name: string, context: Record<string, unknown>) => {
  Sentry.setContext(name, context);
};

/**
 * Manually capture an exception with optional context
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
};

/**
 * Capture a message (for non-error events worth tracking)
 */
export const captureMessage = (
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  Sentry.captureMessage(message, level);
};

/**
 * Add a breadcrumb for debugging context
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
};
