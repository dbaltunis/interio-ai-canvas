/**
 * Generates a consistent color for avatars based on an ID or name
 * The same ID/name will always return the same color
 */

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-amber-500',
];

/**
 * Get a consistent avatar color based on a string (ID or name)
 * @param identifier - User ID, name, or any string identifier
 * @returns Tailwind background color class
 */
export const getAvatarColor = (identifier: string): string => {
  if (!identifier) return AVATAR_COLORS[0];
  
  // Generate a consistent hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to select a color
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ').filter(Boolean);
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};
