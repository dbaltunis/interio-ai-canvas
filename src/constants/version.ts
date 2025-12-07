/**
 * Application version constants
 * Update these when releasing new versions
 */

export const APP_VERSION = "2.3.2";
export const APP_BUILD_DATE = "2025-12-07";
export const APP_BUILD_TIMESTAMP = "2025-12-07T11:00:00Z";

export const getFullVersion = () => {
  return `v${APP_VERSION}-${APP_BUILD_DATE.replace(/-/g, '')}`;
};

export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildDate: APP_BUILD_DATE,
  buildTimestamp: APP_BUILD_TIMESTAMP,
  fullVersion: getFullVersion(),
});
