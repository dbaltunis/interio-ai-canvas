/**
 * Animation utilities for tutorial demo phases
 */

export interface Waypoint {
  x: number;
  y: number;
  at: number; // 0-1 progress
}

/**
 * Check if current progress is within a specific phase range
 */
export const inPhase = (progress: number, start: number, end: number): boolean => {
  return progress >= start && progress <= end;
};

/**
 * Get normalized progress within a phase (0-1 within that phase)
 */
export const phaseProgress = (progress: number, start: number, end: number): number => {
  if (progress < start) return 0;
  if (progress > end) return 1;
  return (progress - start) / (end - start);
};

/**
 * Interpolate cursor position along a path of waypoints
 */
export const interpolatePath = (
  progress: number,
  waypoints: Waypoint[]
): { x: number; y: number } => {
  if (waypoints.length === 0) return { x: 0, y: 0 };
  if (waypoints.length === 1) return { x: waypoints[0].x, y: waypoints[0].y };

  // Find the two waypoints we're between
  for (let i = 0; i < waypoints.length - 1; i++) {
    const current = waypoints[i];
    const next = waypoints[i + 1];

    if (progress >= current.at && progress <= next.at) {
      const segmentProgress = (progress - current.at) / (next.at - current.at);
      // Ease the movement
      const eased = easeInOutCubic(segmentProgress);
      return {
        x: current.x + (next.x - current.x) * eased,
        y: current.y + (next.y - current.y) * eased,
      };
    }
  }

  // If past all waypoints, return last position
  const last = waypoints[waypoints.length - 1];
  return { x: last.x, y: last.y };
};

/**
 * Check if a click should animate at the given progress
 */
export const isClicking = (progress: number, clickTimes: number[], tolerance = 0.03): boolean => {
  return clickTimes.some((t) => Math.abs(progress - t) < tolerance);
};

/**
 * Easing function for smooth animations
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Easing function for quick start, slow end
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Linear interpolation helper
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * t;
};

/**
 * Get staggered animation delay for list items
 */
export const staggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay;
};

/**
 * Calculate typing progress for text animation
 */
export const typingProgress = (
  progress: number,
  startAt: number,
  endAt: number,
  text: string
): string => {
  if (progress < startAt) return "";
  if (progress > endAt) return text;
  
  const typeProgress = (progress - startAt) / (endAt - startAt);
  const charCount = Math.floor(text.length * typeProgress);
  return text.slice(0, charCount);
};
