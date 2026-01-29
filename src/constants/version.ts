/**
 * Application version constants
 * Update these when releasing new versions
 */

export const APP_VERSION = "2.4.2";
export const APP_BUILD_DATE = "2026-01-29";
export const APP_BUILD_TIMESTAMP = "2026-01-29T22:00:00Z";

export const getFullVersion = () => {
  return `v${APP_VERSION}-${APP_BUILD_DATE.replace(/-/g, '')}`;
};

export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildDate: APP_BUILD_DATE,
  buildTimestamp: APP_BUILD_TIMESTAMP,
  fullVersion: getFullVersion(),
});
