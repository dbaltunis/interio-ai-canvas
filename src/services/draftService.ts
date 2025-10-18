/**
 * Draft Service for Auto-Saving Form State
 * Automatically saves form data to localStorage and restores it
 */

interface DraftData {
  windowId: string;
  templateId?: string;
  fabricId?: string;
  hardwareId?: string;
  materialId?: string;
  measurements: Record<string, any>;
  selectedOptions: any[];
  selectedHeading?: string;
  selectedLining?: string;
  windowType?: any;
  timestamp: number;
}

class DraftService {
  private readonly DRAFT_PREFIX = 'draft_window_';
  private readonly DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Save draft for a window
   */
  saveDraft(windowId: string, data: Partial<DraftData>): void {
    try {
      const draft: DraftData = {
        windowId,
        ...data,
        timestamp: Date.now()
      } as DraftData;

      const key = this.getDraftKey(windowId);
      localStorage.setItem(key, JSON.stringify(draft));
      
      console.log(`💾 [Draft] Saved draft for window ${windowId}`);
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }

  /**
   * Load draft for a window
   */
  loadDraft(windowId: string): DraftData | null {
    try {
      const key = this.getDraftKey(windowId);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        return null;
      }

      const draft: DraftData = JSON.parse(stored);
      
      // Check if draft is expired
      if (Date.now() - draft.timestamp > this.DRAFT_EXPIRY) {
        console.log(`🗑️ [Draft] Draft expired for window ${windowId}`);
        this.clearDraft(windowId);
        return null;
      }

      console.log(`📥 [Draft] Loaded draft for window ${windowId}`, {
        age: Math.round((Date.now() - draft.timestamp) / 1000 / 60),
        hasTemplate: !!draft.templateId,
        hasFabric: !!draft.fabricId,
        hasMeasurements: Object.keys(draft.measurements || {}).length
      });

      return draft;
    } catch (error) {
      console.warn('Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Clear draft for a window
   */
  clearDraft(windowId: string): void {
    try {
      const key = this.getDraftKey(windowId);
      localStorage.removeItem(key);
      console.log(`🗑️ [Draft] Cleared draft for window ${windowId}`);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }

  /**
   * Check if a draft exists
   */
  hasDraft(windowId: string): boolean {
    const draft = this.loadDraft(windowId);
    return draft !== null;
  }

  /**
   * Get age of draft in minutes
   */
  getDraftAge(windowId: string): number | null {
    const draft = this.loadDraft(windowId);
    if (!draft) return null;
    
    return Math.round((Date.now() - draft.timestamp) / 1000 / 60);
  }

  /**
   * Clear all expired drafts
   */
  clearExpiredDrafts(): void {
    try {
      const keys = Object.keys(localStorage);
      let cleared = 0;

      for (const key of keys) {
        if (key.startsWith(this.DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const draft = JSON.parse(stored);
            if (Date.now() - draft.timestamp > this.DRAFT_EXPIRY) {
              localStorage.removeItem(key);
              cleared++;
            }
          }
        }
      }

      if (cleared > 0) {
        console.log(`🗑️ [Draft] Cleared ${cleared} expired drafts`);
      }
    } catch (error) {
      console.warn('Failed to clear expired drafts:', error);
    }
  }

  /**
   * Get all drafts
   */
  getAllDrafts(): DraftData[] {
    try {
      const keys = Object.keys(localStorage);
      const drafts: DraftData[] = [];

      for (const key of keys) {
        if (key.startsWith(this.DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const draft = JSON.parse(stored);
            if (Date.now() - draft.timestamp <= this.DRAFT_EXPIRY) {
              drafts.push(draft);
            }
          }
        }
      }

      return drafts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.warn('Failed to get all drafts:', error);
      return [];
    }
  }

  private getDraftKey(windowId: string): string {
    return `${this.DRAFT_PREFIX}${windowId}`;
  }
}

// Export singleton instance
export const draftService = new DraftService();
