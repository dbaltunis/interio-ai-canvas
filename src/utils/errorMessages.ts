/**
 * Error message formatting utilities for user-friendly error display
 */

// Map technical error messages to user-friendly messages
const ERROR_MESSAGE_MAP: Record<string, string> = {
  'violates row-level security policy': 'Permission denied',
  'row-level security': 'Permission denied',
  'violates foreign key constraint': 'This item is linked to other records',
  'foreign key': 'This item is linked to other records',
  'duplicate key value': 'This item already exists',
  'unique constraint': 'This item already exists',
  'not found': 'Item not found',
  'network error': 'Network connection issue',
  'timeout': 'Request timed out',
};

/**
 * Format a mutation error with context about what failed
 */
export const formatMutationError = (
  action: string,
  entityType: string,
  entityName?: string,
  error?: Error | any
): string => {
  const entity = entityName ? `"${entityName}"` : entityType;
  const baseMessage = `Failed to ${action} ${entity}`;

  if (error?.message) {
    const cleanMessage = cleanErrorMessage(error.message);
    return `${baseMessage}: ${cleanMessage}`;
  }

  return `${baseMessage}. Please try again.`;
};

/**
 * Clean up technical error messages for user display
 */
export const cleanErrorMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  for (const [technical, friendly] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (lowerMessage.includes(technical.toLowerCase())) {
      return friendly;
    }
  }

  // Return original message if no mapping found, but clean it up
  return message
    .replace(/^Error:\s*/i, '')
    .replace(/\.$/, '')
    .trim();
};

/**
 * Get an appropriate error title based on error type
 */
export const getErrorTitle = (error?: Error | any): string => {
  if (!error?.message) return 'Error';

  const message = error.message.toLowerCase();

  if (message.includes('permission denied') || message.includes('row-level security')) {
    return 'Permission Denied';
  }
  if (message.includes('foreign key') || message.includes('linked')) {
    return 'Cannot Delete';
  }
  if (message.includes('duplicate') || message.includes('already exists')) {
    return 'Duplicate Entry';
  }
  if (message.includes('not found')) {
    return 'Not Found';
  }
  if (message.includes('network') || message.includes('timeout')) {
    return 'Connection Error';
  }

  return 'Error';
};

/**
 * Format bulk operation result message
 */
export const formatBulkOperationResult = (
  action: string,
  entityType: string,
  succeeded: number,
  failed: number,
  total: number
): { title: string; description: string; isError: boolean } => {
  const plural = total > 1 ? 's' : '';

  if (failed === 0) {
    return {
      title: `${action} ${succeeded} ${entityType}${plural}`,
      description: '',
      isError: false,
    };
  }

  if (succeeded === 0) {
    return {
      title: `Failed to ${action.toLowerCase()} ${entityType}${plural}`,
      description: `All ${total} item${plural} failed. Check permissions and try again.`,
      isError: true,
    };
  }

  return {
    title: `${action} ${succeeded} of ${total} ${entityType}${plural}`,
    description: `${failed} item${failed > 1 ? 's' : ''} failed. Check permissions for those items.`,
    isError: false,
  };
};
