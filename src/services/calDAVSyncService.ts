import { supabase } from "@/integrations/supabase/client";


export interface SyncConflict {
  id: string;
  localEvent: any;
  remoteEvent: any;
  conflictType: 'modified' | 'deleted' | 'created';
  resolvedBy?: 'local' | 'remote' | 'merge';
}

export interface SyncResult {
  success: boolean;
  synced: number;
  conflicts: SyncConflict[];
  errors: string[];
}

class CalDAVSyncService {
  private syncInProgress = new Set<string>();

  async performTwoWaySync(calendarId: string): Promise<SyncResult> {
    if (this.syncInProgress.has(calendarId)) {
      throw new Error('Sync already in progress for this calendar');
    }

    this.syncInProgress.add(calendarId);
    
    try {
      // Get calendar configuration
      const { data: calendar } = await supabase
        .from('caldav_calendars')
        .select('*, account:caldav_accounts(*)')
        .eq('id', calendarId)
        .single();

      if (!calendar) {
        throw new Error('Calendar not found');
      }

      // Get last sync token for incremental sync
      const lastSyncToken = calendar.sync_token;
      
      // Initialize CalDAV client
      const client = await this.createCalDAVClient(calendar.account);
      
      // Fetch changes since last sync
      const remoteChanges = await this.fetchRemoteChanges(client, calendar, lastSyncToken);
      const localChanges = await this.fetchLocalChanges(calendarId, calendar.last_sync_at);
      
      // Detect conflicts
      const conflicts = this.detectConflicts(localChanges, remoteChanges);
      
      // Apply non-conflicting changes
      const syncResult = await this.applyChanges(calendarId, remoteChanges, localChanges, conflicts);
      
      // Update sync token and timestamp
      await this.updateSyncStatus(calendarId, remoteChanges.syncToken);
      
      return syncResult;
    } finally {
      this.syncInProgress.delete(calendarId);
    }
  }

  private async createCalDAVClient(account: any) {
    const { createDAVClient } = await import('tsdav');
    const client = await createDAVClient({
      serverUrl: account.server_url,
      credentials: {
        username: account.username,
        password: account.password_encrypted, // In real app, this should be decrypted
      },
      defaultAccountType: 'caldav',
    });
    
    return client;
  }

  private async fetchRemoteChanges(client: any, calendar: any, syncToken?: string) {
    try {
      // Use sync-collection REPORT for incremental sync if sync token exists
      if (syncToken) {
        const response = await client.syncCollection({
          url: calendar.calendar_id,
          syncToken: syncToken,
        });
        
        return {
          events: response.objects || [],
          syncToken: response.syncToken,
          isIncremental: true,
        };
      } else {
        // Full sync if no sync token
        const events = await client.fetchCalendarObjects({
          calendar: { url: calendar.calendar_id },
        });
        
        return {
          events: events || [],
          syncToken: null,
          isIncremental: false,
        };
      }
    } catch (error) {
      console.error('Failed to fetch remote changes:', error);
      throw error;
    }
  }

  private async fetchLocalChanges(calendarId: string, lastSyncAt?: string) {
    const query = supabase
      .from('appointments')
      .select('*');
    
    if (lastSyncAt) {
      query.gt('updated_at', lastSyncAt);
    }
    
    const { data: appointments, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return appointments || [];
  }

  private detectConflicts(localChanges: any[], remoteChanges: any): SyncConflict[] {
    const conflicts: SyncConflict[] = [];
    
    // Create maps for easier lookup
    const localMap = new Map(localChanges.map(event => [event.caldav_uid, event]));
    const remoteMap = new Map(remoteChanges.events.map((event: any) => [event.uid, event]));
    
    // Check for conflicts where both local and remote versions were modified
    for (const [uid, localEvent] of localMap) {
      const remoteEvent = remoteMap.get(uid);
      
      if (remoteEvent && this.hasConflict(localEvent, remoteEvent)) {
        conflicts.push({
          id: uid,
          localEvent,
          remoteEvent,
          conflictType: 'modified',
        });
      }
    }
    
    return conflicts;
  }

  private hasConflict(localEvent: any, remoteEvent: any): boolean {
    // Simple conflict detection based on last modified timestamps
    const localModified = new Date(localEvent.updated_at);
    const remoteModified = new Date(remoteEvent.lastModified || remoteEvent.dtstamp);
    
    // If both were modified after the last sync, it's a conflict
    return Math.abs(localModified.getTime() - remoteModified.getTime()) > 60000; // 1 minute tolerance
  }

  private async applyChanges(
    calendarId: string, 
    remoteChanges: any, 
    localChanges: any[], 
    conflicts: SyncConflict[]
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      conflicts,
      errors: [],
    };

    // Apply remote changes to local database
    for (const remoteEvent of remoteChanges.events) {
      try {
        // Skip conflicted events (handle separately)
        if (conflicts.some(c => c.id === remoteEvent.uid)) {
          continue;
        }

        await this.applyRemoteChange(calendarId, remoteEvent);
        result.synced++;
      } catch (error) {
        result.errors.push(`Failed to apply remote change: ${error}`);
      }
    }

    // Apply local changes to remote calendar
    for (const localEvent of localChanges) {
      try {
        // Skip conflicted events
        if (conflicts.some(c => c.id === localEvent.caldav_uid)) {
          continue;
        }

        await this.applyLocalChange(calendarId, localEvent);
        result.synced++;
      } catch (error) {
        result.errors.push(`Failed to apply local change: ${error}`);
      }
    }

    return result;
  }

  private async applyRemoteChange(calendarId: string, remoteEvent: any) {
    // Convert CalDAV event to appointment format
    const appointmentData = this.convertCalDAVToAppointment(remoteEvent, calendarId);
    
    // Check if appointment already exists
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('caldav_uid', remoteEvent.uid)
      .single();

    if (existing) {
      // Update existing appointment
      const { error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('caldav_uid', remoteEvent.uid);
      
      if (error) throw error;
    } else {
      // Create new appointment with a user_id (required field)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id,
          caldav_uid: remoteEvent.uid,
        });
      
      if (error) throw error;
    }
  }

  private async applyLocalChange(calendarId: string, localEvent: any) {
    // Convert appointment to CalDAV format and sync to remote calendar
    // This would require the CalDAV client to push changes
    // Implementation depends on the specific CalDAV server capabilities
    console.log('Applying local change to remote calendar:', localEvent);
  }

  private convertCalDAVToAppointment(calDAVEvent: any, calendarId: string) {
    // Parse the CalDAV event data and convert to appointment format
    return {
      title: calDAVEvent.summary || 'Untitled Event',
      description: calDAVEvent.description || '',
      start_time: new Date(calDAVEvent.dtstart).toISOString(),
      end_time: new Date(calDAVEvent.dtend).toISOString(),
      location: calDAVEvent.location || '',
      caldav_calendar_id: calendarId,
      caldav_etag: calDAVEvent.etag || '',
      last_caldav_sync: new Date().toISOString(),
    };
  }

  private async updateSyncStatus(calendarId: string, syncToken?: string) {
    await supabase
      .from('caldav_calendars')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_token: syncToken,
      })
      .eq('id', calendarId);
  }

  async resolveConflict(conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    switch (resolution) {
      case 'local':
        // Keep local version, overwrite remote
        await this.applyLocalChange(conflict.localEvent.caldav_calendar_id, conflict.localEvent);
        break;
      
      case 'remote':
        // Keep remote version, overwrite local
        await this.applyRemoteChange(conflict.remoteEvent.calendarId, conflict.remoteEvent);
        break;
      
      case 'merge':
        // Merge both versions (custom logic needed)
        const mergedEvent = this.mergeEvents(conflict.localEvent, conflict.remoteEvent);
        await this.applyRemoteChange(mergedEvent.caldav_calendar_id, mergedEvent);
        await this.applyLocalChange(mergedEvent.caldav_calendar_id, mergedEvent);
        break;
    }
  }

  private mergeEvents(localEvent: any, remoteEvent: any) {
    // Simple merge strategy - could be more sophisticated
    return {
      ...localEvent,
      description: `${localEvent.description}\n\n[Remote]: ${remoteEvent.description}`,
      // Keep local times but note the conflict
      notes: `Merged from conflict - Remote time was ${remoteEvent.dtstart} to ${remoteEvent.dtend}`,
    };
  }

  async schedulePeriodicSync(calendarId: string, intervalMinutes: number = 15) {
    // In a real app, this would use a background service or cron job
    setInterval(async () => {
      try {
        await this.performTwoWaySync(calendarId);
        console.log(`Periodic sync completed for calendar ${calendarId}`);
      } catch (error) {
        console.error(`Periodic sync failed for calendar ${calendarId}:`, error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export const calDAVSyncService = new CalDAVSyncService();
