/**
 * Feature Flags Configuration
 * 
 * Control visibility of features in production without removing code.
 * Set flag to true when feature is ready for production deployment.
 */

export const FEATURE_FLAGS = {
  /**
   * Material Purchasing & Ordering Hub
   * Controls access to purchasing workflow, ordering hub, and material queue management
   */
  PURCHASING_ENABLED: false, // Set to true when ready for production
} as const;
