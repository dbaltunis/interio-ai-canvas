import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SaveQueueItem {
  id: string;
  data: any;
  retries: number;
  timestamp: number;
  tableName: string;
  onConflict?: string;
}

class SaveQueueService {
  private queue: SaveQueueItem[] = [];
  private processing = false;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000; // 2 seconds base delay
  private readonly LOCAL_STORAGE_KEY = 'saveQueue';
  private readonly LOCAL_STORAGE_BACKUP_KEY = 'saveBackup';

  constructor() {
    // Load any pending saves from localStorage on init
    this.loadPendingQueue();
  }

  /**
   * Enqueue a save operation with automatic retry
   */
  async enqueueSave(
    tableName: string,
    data: any,
    options?: { onConflict?: string }
  ): Promise<string> {
    const saveId = crypto.randomUUID();

    console.log(`💾 [SaveQueue] Enqueueing save for ${tableName}:`, {
      saveId,
      dataSize: JSON.stringify(data).length,
      onConflict: options?.onConflict
    });

    // Create backup in localStorage FIRST
    this.backupToLocalStorage(saveId, tableName, data);

    // Add to queue
    const queueItem: SaveQueueItem = {
      id: saveId,
      data,
      retries: 0,
      timestamp: Date.now(),
      tableName,
      onConflict: options?.onConflict
    };

    this.queue.push(queueItem);
    this.persistQueue();

    // Show loading toast
    toast.loading(`Saving ${tableName}...`, { id: saveId });

    // Process immediately
    this.processQueue();

    return saveId;
  }

  /**
   * Process the save queue with retry logic
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await this.processSaveItem(item);
        
        // Success - remove from queue
        this.queue.shift();
        this.persistQueue();
        
      } catch (error: any) {
        console.error(`❌ [SaveQueue] Save failed for ${item.id}:`, error);
        
        item.retries++;
        
        if (item.retries < this.MAX_RETRIES) {
          // Retry with exponential backoff
          const delay = this.RETRY_DELAY * Math.pow(2, item.retries - 1);
          
          toast.error(
            `Save failed, retrying in ${delay / 1000}s... (${item.retries}/${this.MAX_RETRIES})`,
            { id: item.id }
          );
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } else {
          // Max retries reached - keep in localStorage for manual recovery
          console.error(`❌ [SaveQueue] Max retries reached for ${item.id}`);
          
          toast.error(
            `Save failed after ${this.MAX_RETRIES} attempts. Changes saved locally.`,
            { 
              id: item.id,
              duration: 10000,
              action: {
                label: 'Retry',
                onClick: () => this.retryFailedSave(item.id)
              }
            }
          );
          
          // Move to failed saves in localStorage
          this.moveToFailedSaves(item);
          
          // Remove from active queue
          this.queue.shift();
          this.persistQueue();
        }
      }
    }

    this.processing = false;
  }

  /**
   * Process a single save item
   */
  private async processSaveItem(item: SaveQueueItem): Promise<void> {
    console.log(`🔄 [SaveQueue] Processing save ${item.id}:`, {
      table: item.tableName,
      attempt: item.retries + 1,
      dataSize: JSON.stringify(item.data).length
    });

    const startTime = Date.now();

    const upsertOptions: any = {};
    if (item.onConflict) {
      upsertOptions.onConflict = item.onConflict;
    }

    // Use type assertion to bypass strict table name checking
    const { data, error } = await (supabase as any)
      .from(item.tableName)
      .upsert(item.data, upsertOptions)
      .select()
      .maybeSingle();

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`❌ [SaveQueue] Database error:`, error);
      throw error;
    }

    console.log(`✅ [SaveQueue] Save successful in ${duration}ms:`, {
      saveId: item.id,
      table: item.tableName,
      dataReturned: !!data
    });

    // Success toast
    toast.success(`Saved successfully! (${duration}ms)`, { id: item.id });

    // Clear localStorage backup
    this.clearLocalStorageBackup(item.id);
  }

  /**
   * Backup data to localStorage before attempting save
   */
  private backupToLocalStorage(saveId: string, tableName: string, data: any) {
    try {
      const backup = {
        saveId,
        tableName,
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(
        `${this.LOCAL_STORAGE_BACKUP_KEY}_${saveId}`,
        JSON.stringify(backup)
      );
      
      console.log(`💾 [SaveQueue] Backed up to localStorage:`, saveId);
    } catch (error) {
      console.warn('Failed to backup to localStorage:', error);
    }
  }

  /**
   * Clear localStorage backup after successful save
   */
  private clearLocalStorageBackup(saveId: string) {
    try {
      localStorage.removeItem(`${this.LOCAL_STORAGE_BACKUP_KEY}_${saveId}`);
      console.log(`🗑️ [SaveQueue] Cleared backup:`, saveId);
    } catch (error) {
      console.warn('Failed to clear backup:', error);
    }
  }

  /**
   * Persist current queue to localStorage
   */
  private persistQueue() {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to persist queue:', error);
    }
  }

  /**
   * Load pending queue from localStorage
   */
  private loadPendingQueue() {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📥 [SaveQueue] Loaded ${this.queue.length} pending saves from localStorage`);
        
        if (this.queue.length > 0) {
          toast.info(`Resuming ${this.queue.length} pending save(s)...`);
          this.processQueue();
        }
      }
    } catch (error) {
      console.warn('Failed to load pending queue:', error);
    }
  }

  /**
   * Move failed save to separate storage for manual recovery
   */
  private moveToFailedSaves(item: SaveQueueItem) {
    try {
      const failedSaves = this.getFailedSaves();
      failedSaves.push({
        ...item,
        failedAt: Date.now()
      });
      
      localStorage.setItem('failedSaves', JSON.stringify(failedSaves));
      console.log(`💾 [SaveQueue] Moved to failed saves:`, item.id);
    } catch (error) {
      console.warn('Failed to store failed save:', error);
    }
  }

  /**
   * Get all failed saves
   */
  getFailedSaves(): any[] {
    try {
      const stored = localStorage.getItem('failedSaves');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to get failed saves:', error);
      return [];
    }
  }

  /**
   * Retry a failed save
   */
  async retryFailedSave(saveId: string) {
    const failedSaves = this.getFailedSaves();
    const failedItem = failedSaves.find(item => item.id === saveId);
    
    if (!failedItem) {
      toast.error('Failed save not found');
      return;
    }

    // Remove from failed saves
    const updatedFailed = failedSaves.filter(item => item.id !== saveId);
    localStorage.setItem('failedSaves', JSON.stringify(updatedFailed));

    // Add back to queue with reset retry count
    failedItem.retries = 0;
    this.queue.push(failedItem);
    this.persistQueue();

    toast.info('Retrying save...');
    this.processQueue();
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      failedSaves: this.getFailedSaves().length
    };
  }

  /**
   * Clear all failed saves
   */
  clearFailedSaves() {
    localStorage.removeItem('failedSaves');
    toast.success('Cleared failed saves');
  }
}

// Export singleton instance
export const saveQueueService = new SaveQueueService();
