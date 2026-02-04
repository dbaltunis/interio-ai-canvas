/**
 * User-friendly error messaging system
 * Maps technical errors to helpful, plain-language messages with clear next steps
 */

export type ErrorIcon = 'network' | 'permission' | 'validation' | 'session' | 'config' | 'calculator' | 'general';

export interface FriendlyError {
  title: string;
  message: string;
  icon: ErrorIcon;
  persistent: boolean;
  showLoginButton?: boolean;
  autoDismissMs?: number;
}

interface ErrorPattern {
  patterns: string[];
  error: FriendlyError;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Project lock/status errors - persistent with clear guidance
  {
    patterns: ['project is in', 'project locked', 'status prevents', 'cannot add room', 'cannot add window', 'cannot add treatment', 'cannot update room', 'cannot update window', 'cannot update treatment', 'cannot delete room', 'cannot delete window', 'cannot delete treatment'],
    error: {
      title: "Project is locked",
      message: "This project is in a status that prevents changes. To make edits, change the status back to 'Draft' or 'In Progress'.",
      icon: 'permission',
      persistent: true,
    }
  },
  
  // Network/Connection errors - auto-dismiss after 8 seconds
  {
    patterns: ['network', 'failed to fetch', 'connection', 'timeout', 'net::err', 'networkerror', 'cors'],
    error: {
      title: "Connection issue",
      message: "We couldn't reach the server. Check your internet connection and try again.",
      icon: 'network',
      persistent: false,
      autoDismissMs: 8000,
    }
  },
  
  // Session/Auth errors - persistent with login button
  {
    patterns: ['session expired', 'log in again', 'not authenticated', 'jwt expired', 'invalid jwt', 'refresh_token', 'auth session missing'],
    error: {
      title: "Session expired",
      message: "For security, you've been logged out. Please log in again to continue.",
      icon: 'session',
      persistent: true,
      showLoginButton: true,
    }
  },
  
  // Permission/RLS errors - persistent
  {
    patterns: ['row-level security', 'permission denied', 'rls', 'not authorized', 'unauthorized', 'forbidden', '403'],
    error: {
      title: "Permission needed",
      message: "You don't have access to this action. If you need access, ask your account administrator.",
      icon: 'permission',
      persistent: true,
    }
  },
  
  // Configuration/Setup errors - persistent
  {
    patterns: ['not configured', 'setup required', 'missing configuration', 'price grid not found', 'pricing not set', 'no pricing'],
    error: {
      title: "Setup needed",
      message: "This feature needs some configuration first. Go to Settings > Business to complete setup.",
      icon: 'config',
      persistent: true,
    }
  },
  
  // Calculator/Pricing range errors - persistent
  {
    patterns: ['exceeds maximum', 'below minimum', 'outside range', 'dimension too', 'width exceeds', 'height exceeds', 'drop exceeds'],
    error: {
      title: "Measurement outside range",
      message: "The entered dimensions are outside the available pricing range. Try smaller measurements, or contact your supplier for custom pricing.",
      icon: 'calculator',
      persistent: true,
    }
  },
  
  // Validation errors - auto-dismiss after 6 seconds
  {
    patterns: ['required', 'invalid', 'must be', 'cannot be empty', 'validation', 'minimum', 'maximum'],
    error: {
      title: "Please check your input",
      message: "Some fields need attention. Review the highlighted fields and try again.",
      icon: 'validation',
      persistent: false,
      autoDismissMs: 6000,
    }
  },
  
  // Duplicate/Conflict errors - persistent
  {
    patterns: ['duplicate', 'already exists', 'unique constraint', 'conflict'],
    error: {
      title: "Item already exists",
      message: "An item with this name or identifier already exists. Try using a different name.",
      icon: 'validation',
      persistent: true,
    }
  },
  
  // Foreign key/linked data errors - persistent
  {
    patterns: ['foreign key', 'referenced', 'linked to other', 'cannot delete', 'has related'],
    error: {
      title: "Item is in use",
      message: "This item is linked to other records and cannot be deleted. Remove the linked items first, or archive this instead.",
      icon: 'config',
      persistent: true,
    }
  },
  
  // Password errors - persistent
  {
    patterns: ['password', 'weak password', 'password strength', 'password policy', 'same password'],
    error: {
      title: "Password update failed",
      message: "The password doesn't meet requirements. Use at least 8 characters with a mix of letters and numbers.",
      icon: 'validation',
      persistent: true,
    }
  },
  
  // Not found errors - persistent
  {
    patterns: ['not found', '404', 'does not exist', 'no longer available'],
    error: {
      title: "Item not found",
      message: "The item you're looking for may have been moved or deleted. Try refreshing the page.",
      icon: 'general',
      persistent: true,
    }
  },
  
  // Rate limiting errors - auto-dismiss
  {
    patterns: ['rate limit', 'too many requests', '429', 'slow down'],
    error: {
      title: "Too many requests",
      message: "Please wait a moment before trying again. The system needs a brief pause.",
      icon: 'network',
      persistent: false,
      autoDismissMs: 5000,
    }
  },
  
  // Server errors - persistent
  {
    patterns: ['500', 'internal server', 'server error', 'something went wrong'],
    error: {
      title: "Something went wrong",
      message: "We encountered an unexpected issue. Please try again, or contact support if this continues.",
      icon: 'general',
      persistent: true,
    }
  },
];

// Default fallback error
const DEFAULT_ERROR: FriendlyError = {
  title: "Something went wrong",
  message: "An unexpected error occurred. Please try again.",
  icon: 'general',
  persistent: false,
  autoDismissMs: 8000,
};

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return '';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    
    // Common error object shapes
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    if (typeof errorObj.error_description === 'string') {
      return errorObj.error_description;
    }
    if (errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }
  }
  
  return String(error);
}

/**
 * Get a user-friendly error based on the raw error
 * @param error - The raw error (string, Error object, or any error shape)
 * @param context - Optional context about what the user was trying to do
 * @returns FriendlyError with title, message, icon, and display settings
 */
export function getFriendlyError(error: unknown, context?: string): FriendlyError {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  
  // Find matching pattern
  for (const pattern of ERROR_PATTERNS) {
    const hasMatch = pattern.patterns.some(p => errorMessage.includes(p.toLowerCase()));
    if (hasMatch) {
      // If context is provided, we can enhance the message
      if (context) {
        return {
          ...pattern.error,
          message: enhanceMessageWithContext(pattern.error.message, context),
        };
      }
      return { ...pattern.error };
    }
  }
  
  // Return default error, optionally enhanced with context
  if (context) {
    return {
      ...DEFAULT_ERROR,
      message: `Unable to ${context}. Please try again.`,
    };
  }
  
  return { ...DEFAULT_ERROR };
}

/**
 * Enhance error message with context about what the user was doing
 */
function enhanceMessageWithContext(baseMessage: string, context: string): string {
  // For some messages, prepend the context
  const contextPrefix = `Unable to ${context}. `;
  
  // Don't add context if the message already mentions a specific action
  if (baseMessage.includes('you') || baseMessage.includes('your')) {
    return baseMessage;
  }
  
  return contextPrefix + baseMessage;
}

/**
 * Check if an error is a session/auth error that requires re-login
 */
export function isSessionError(error: unknown): boolean {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  const sessionPatterns = ['session expired', 'log in again', 'not authenticated', 'jwt expired', 'invalid jwt', 'refresh_token', 'auth session missing'];
  return sessionPatterns.some(p => errorMessage.includes(p));
}

/**
 * Check if an error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  const errorMessage = extractErrorMessage(error).toLowerCase();
  const networkPatterns = ['network', 'failed to fetch', 'connection', 'timeout', 'net::err'];
  return networkPatterns.some(p => errorMessage.includes(p));
}
