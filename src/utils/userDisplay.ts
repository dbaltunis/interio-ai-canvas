import { formatDistanceToNow } from 'date-fns';

export const formatDisplayName = (displayName: string): string => {
  if (!displayName) return 'Unknown User';
  
  // Handle email addresses
  if (displayName.includes('@')) {
    const username = displayName.split('@')[0];
    return formatDisplayName(username);
  }
  
  // Split by common separators
  const parts = displayName.split(/[\s._-]+/).filter(Boolean);
  
  if (parts.length === 1) {
    // Single name, truncate if too long
    return parts[0].length > 10 ? `${parts[0].substring(0, 8)}...` : parts[0];
  }
  
  if (parts.length >= 2) {
    // First name + last initial
    const firstName = parts[0];
    const lastInitial = parts[1].charAt(0).toUpperCase();
    
    if (firstName.length > 8) {
      return `${firstName.substring(0, 6)}... ${lastInitial}.`;
    }
    
    return `${firstName} ${lastInitial}.`;
  }
  
  return displayName;
};

export const formatLastSeen = (lastSeen: string): string => {
  try {
    const date = new Date(lastSeen);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

export const getInitials = (displayName: string): string => {
  if (!displayName) return 'U';
  
  // Handle email addresses
  if (displayName.includes('@')) {
    const username = displayName.split('@')[0];
    return getInitials(username);
  }
  
  const parts = displayName.split(/[\s._-]+/).filter(Boolean);
  
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  
  return displayName.charAt(0).toUpperCase();
};