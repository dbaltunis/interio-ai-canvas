// Lazy-load Sentry to avoid conflicts with React initialization
let SentryModule: typeof import('@sentry/react') | null = null;
let isInitialized = false;

/**
 * Initialize Sentry error monitoring
 * Call this once at app startup after React is ready
 */
export const initSentry = async () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    if (import.meta.env.MODE === 'production') {
      console.warn('[Sentry] No DSN configured - error tracking disabled');
    }
    return;
  }

  try {
    // Dynamic import to avoid loading Sentry before React is ready
    SentryModule = await import('@sentry/react');
    
    SentryModule.init({
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
    
    isInitialized = true;
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.warn('[Sentry] Failed to initialize:', error);
  }
};

/**
 * Set user context for error tracking
 * Call when user signs in/out
 */
export const setSentryUser = (user: { id: string; email?: string; role?: string } | null) => {
  if (!SentryModule || !isInitialized) return;
  
  if (user) {
    SentryModule.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    SentryModule.setUser(null);
  }
};

/**
 * Add contextual information to all subsequent errors
 */
export const setSentryContext = (name: string, context: Record<string, unknown>) => {
  if (!SentryModule || !isInitialized) return;
  SentryModule.setContext(name, context);
};

/**
 * Manually capture an exception with optional context
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  if (!SentryModule || !isInitialized) {
    console.error('[Sentry] Not initialized, logging error:', error);
    return;
  }
  
  SentryModule.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    SentryModule!.captureException(error);
  });
};

/**
 * Capture a message (for non-error events worth tracking)
 */
export const captureMessage = (
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  if (!SentryModule || !isInitialized) return;
  SentryModule.captureMessage(message, level);
};

/**
 * Add a breadcrumb for debugging context
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, unknown>
) => {
  if (!SentryModule || !isInitialized) return;
  SentryModule.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
};

/**
 * Get Sentry module for ErrorBoundary integration
 */
export const getSentryModule = () => SentryModule;
