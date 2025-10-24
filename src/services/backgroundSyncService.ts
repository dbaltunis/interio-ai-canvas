import { caldavService } from './caldavService';
import { supabase } from '@/integrations/supabase/client';
import { offlineQueueService } from './offlineQueueService';

class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupNetworkListeners();
    this.startPeriodicSync();
    // Process any queued operations on startup if online
    if (this.isOnline) {
      setTimeout(() => offlineQueueService.processQueue(), 2000);
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network came online, resuming sync');
      this.startPeriodicSync();
      // Process queued operations when back online
      setTimeout(() => offlineQueueService.processQueue(), 1000);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network went offline, pausing sync');
      this.stopPeriodicSync();
    });
  }

  public startPeriodicSync() {
    if (this.syncInterval || !this.isOnline) return;

    console.log('Starting background calendar sync');
    this.syncInterval = setInterval(async () => {
      await this.performBackgroundSync();
    }, this.SYNC_INTERVAL_MS);

    // Perform initial sync
    setTimeout(() => this.performBackgroundSync(), 1000);
  }

  public stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Stopped background calendar sync');
    }
  }

  private async performBackgroundSync() {
    if (!this.isOnline) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Performing background calendar sync');
      const accounts = await caldavService.getAccounts();
      
      for (const account of accounts) {
        if (!account.active || !account.sync_enabled) continue;

        // Skip accounts without valid server URLs
        if (!account.server_url || account.server_url.trim() === '') {
          console.warn(`Skipping sync for account ${account.account_name} - no valid server URL`);
          continue;
        }

        try {
          await this.syncAccountCalendars(account);
        } catch (error) {
          console.error(`Failed to sync account ${account.account_name}:`, error);
          await this.logSyncError(account.id, error);
        }
      }

      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private async syncAccountCalendars(account: any) {
    const calendars = await caldavService.getCalendars(account.id);
    
    for (const calendar of calendars) {
      if (!calendar.sync_enabled) continue;

      try {
        await this.syncCalendarWithRetry(calendar.id);
        
        // Update last sync timestamp
        await supabase
          .from('caldav_calendars')
          .update({ 
            last_sync_at: new Date().toISOString() 
          })
          .eq('id', calendar.id);

      } catch (error) {
        console.error(`Failed to sync calendar ${calendar.display_name}:`, error);
        await this.logSyncError(account.id, error, calendar.id);
      }
    }
  }

  private async syncCalendarWithRetry(calendarId: string, attempt = 1): Promise<void> {
    try {
      await caldavService.syncEventsFromCalDAV(calendarId);
    } catch (error) {
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        console.log(`Sync attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // exponential backoff
        return this.syncCalendarWithRetry(calendarId, attempt + 1);
      }
      throw error;
    }
  }

  private async logSyncError(accountId: string, error: any, calendarId?: string) {
    try {
      await supabase.from('caldav_sync_log').insert({
        account_id: accountId,
        calendar_id: calendarId || null,
        sync_type: 'incremental',
        status: 'failed',
        error_message: error.message || String(error),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }
  }

  public async forceSyncAll(): Promise<void> {
    console.log('Force syncing all calendars');
    await this.performBackgroundSync();
  }

  public async syncSpecificCalendar(calendarId: string): Promise<void> {
    try {
      await this.syncCalendarWithRetry(calendarId);
      
      await supabase
        .from('caldav_calendars')
        .update({ 
          last_sync_at: new Date().toISOString() 
        })
        .eq('id', calendarId);

      console.log(`Successfully synced calendar ${calendarId}`);
    } catch (error) {
      console.error(`Failed to sync calendar ${calendarId}:`, error);
      throw error;
    }
  }

  public getSyncStatus(): {
    isRunning: boolean;
    isOnline: boolean;
    nextSyncIn: number | null;
    queueStatus: any;
  } {
    return {
      isRunning: !!this.syncInterval,
      isOnline: this.isOnline,
      nextSyncIn: this.syncInterval ? this.SYNC_INTERVAL_MS : null,
      queueStatus: offlineQueueService.getQueueStatus(),
    };
  }
}

export const backgroundSyncService = new BackgroundSyncService();