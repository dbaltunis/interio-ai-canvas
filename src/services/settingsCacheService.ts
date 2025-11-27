/**
 * Settings Cache Service
 * Provides instant access to user settings with background sync
 */

interface CachedSettings {
  data: any;
  timestamp: number;
  version: string;
}

const CACHE_VERSION = '1.0';
const CACHE_KEYS = {
  BUSINESS_SETTINGS: 'interio_business_settings',
  USER_PREFERENCES: 'interio_user_preferences',
  MEASUREMENT_UNITS: 'interio_measurement_units',
  CURRENCY: 'interio_currency',
};

class SettingsCacheService {
  /**
   * Save settings to cache with timestamp
   */
  set(key: string, data: any): void {
    try {
      const cached: CachedSettings = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache settings:', error);
    }
  }

  /**
   * Get cached settings if available and not stale
   */
  get(key: string, maxAgeMs: number = 60 * 60 * 1000): any | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CachedSettings = JSON.parse(item);
      
      // Check version compatibility
      if (cached.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      // Check if stale
      const age = Date.now() - cached.timestamp;
      if (age > maxAgeMs) {
        return null; // Stale, but don't remove - let background sync update
      }

      return cached.data;
    } catch (error) {
      console.warn('Failed to read cached settings:', error);
      return null;
    }
  }

  /**
   * Get cached settings immediately without age check (for instant load)
   */
  getInstant(key: string): any | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CachedSettings = JSON.parse(item);
      
      // Check version compatibility
      if (cached.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn('Failed to read cached settings:', error);
      return null;
    }
  }

  /**
   * Remove cached settings
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached settings:', error);
    }
  }

  /**
   * Clear all cached settings
   */
  clearAll(): void {
    Object.values(CACHE_KEYS).forEach(key => this.remove(key));
  }

  /**
   * Get cache timestamp for display
   */
  getTimestamp(key: string): number | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CachedSettings = JSON.parse(item);
      return cached.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if cache is stale
   */
  isStale(key: string, maxAgeMs: number = 60 * 60 * 1000): boolean {
    const timestamp = this.getTimestamp(key);
    if (!timestamp) return true;

    const age = Date.now() - timestamp;
    return age > maxAgeMs;
  }
}

export const settingsCacheService = new SettingsCacheService();
export { CACHE_KEYS };
