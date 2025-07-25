import { supabase } from '@/integrations/supabase/client';

export interface CalDAVAccount {
  id: string;
  user_id: string;
  account_name: string;
  email: string;
  server_url?: string;
  username: string;
  password_encrypted: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  sync_token?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalDAVCalendar {
  id: string;
  account_id: string;
  calendar_id: string;
  display_name: string;
  description?: string;
  color?: string;
  timezone: string;
  sync_enabled: boolean;
  read_only: boolean;
  last_sync_at?: string;
  sync_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CalDAVEvent {
  uid: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  calendar_id: string;
  etag?: string;
  url?: string;
}

class CalDAVService {
  private clients: Map<string, any> = new Map();

  // Discover CalDAV server URL from email
  private async discoverCalDAVServer(email: string): Promise<string | null> {
    const domain = email.split('@')[1];
    
    // Common CalDAV server patterns
    const patterns = [
      `https://caldav.${domain}/`,
      `https://${domain}/caldav/`,
      `https://${domain}/.well-known/caldav`,
      `https://mail.${domain}/caldav/`,
    ];

    // Add known provider URLs
    const knownProviders: Record<string, string> = {
      'gmail.com': 'https://apidata.googleusercontent.com/caldav/v2/',
      'googlemail.com': 'https://apidata.googleusercontent.com/caldav/v2/',
      'outlook.com': 'https://outlook.live.com/owa/calendar',
      'hotmail.com': 'https://outlook.live.com/owa/calendar',
      'live.com': 'https://outlook.live.com/owa/calendar',
      'icloud.com': 'https://caldav.icloud.com/',
      'me.com': 'https://caldav.icloud.com/',
      'mac.com': 'https://caldav.icloud.com/',
      'yahoo.com': 'https://caldav.calendar.yahoo.com/',
    };

    if (knownProviders[domain]) {
      return knownProviders[domain];
    }

    // Try to discover automatically
    for (const pattern of patterns) {
      try {
        const response = await fetch(pattern, { method: 'HEAD' });
        if (response.ok) {
          return pattern;
        }
      } catch (error) {
        // Continue to next pattern
        console.debug(`Failed to connect to ${pattern}`);
      }
    }

    return null;
  }

  // Create DAV client (simplified mock for now)
  private async createDAVClient(account: CalDAVAccount): Promise<any> {
    const password = this.decryptPassword(account.password_encrypted);
    let serverUrl = account.server_url;

    // Auto-discover server URL if not provided
    if (!serverUrl) {
      serverUrl = await this.discoverCalDAVServer(account.email);
      if (!serverUrl) {
        throw new Error(`Could not discover CalDAV server for ${account.email}`);
      }
    }

    // Mock client for now - replace with actual CalDAV implementation
    const mockClient = {
      serverUrl,
      credentials: {
        username: account.username,
        password,
      },
      authMethod: 'Basic',
      accountType: 'caldav',
    };

    this.clients.set(account.id, mockClient);
    return mockClient;
  }

  // Simple encryption/decryption (in production, use proper encryption)
  private encryptPassword(password: string): string {
    return btoa(password); // Base64 encoding - replace with proper encryption
  }

  private decryptPassword(encryptedPassword: string): string {
    return atob(encryptedPassword); // Base64 decoding - replace with proper decryption
  }

  // Add CalDAV account
  async addAccount(accountData: {
    account_name: string;
    email: string;
    username: string;
    password: string;
    server_url?: string;
  }): Promise<CalDAVAccount> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const encryptedPassword = this.encryptPassword(accountData.password);

    const { data, error } = await supabase
      .from('caldav_accounts')
      .insert({
        user_id: user.id,
        account_name: accountData.account_name,
        email: accountData.email,
        username: accountData.username,
        password_encrypted: encryptedPassword,
        server_url: accountData.server_url,
      })
      .select()
      .single();

    if (error) throw error;

    // Test connection and discover calendars
    await this.testConnection(data);
    await this.discoverCalendars(data.id);

    return data;
  }

  // Test CalDAV connection
  async testConnection(account: CalDAVAccount): Promise<boolean> {
    try {
      const client = await this.createDAVClient(account);
      // Mock success for testing - replace with actual CalDAV test
      console.log('Testing CalDAV connection for:', account.email);
      return true;
    } catch (error) {
      console.error('CalDAV connection test failed:', error);
      return false;
    }
  }

  // Discover and save calendars
  async discoverCalendars(accountId: string): Promise<CalDAVCalendar[]> {
    const { data: account } = await supabase
      .from('caldav_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (!account) throw new Error('Account not found');

    const client = await this.createDAVClient(account);
    
    // Mock calendar discovery - replace with actual CalDAV discovery
    const mockCalendars = [
      {
        url: `${client.serverUrl}/calendars/${account.username}/calendar/`,
        displayName: 'My Calendar',
        description: 'Default calendar',
        calendarColor: '#3B82F6',
        timezone: 'UTC'
      }
    ];

    const caldavCalendars: CalDAVCalendar[] = [];

    for (const calendar of mockCalendars) {
      const { data, error } = await supabase
        .from('caldav_calendars')
        .insert({
          account_id: accountId,
          calendar_id: calendar.url,
          display_name: calendar.displayName,
          description: calendar.description,
          color: calendar.calendarColor,
          timezone: calendar.timezone || 'UTC',
          sync_enabled: true,
          read_only: false,
        })
        .select()
        .single();

      if (!error && data) {
        caldavCalendars.push(data);
      }
    }

    return caldavCalendars;
  }

  // Get all accounts for user
  async getAccounts(): Promise<CalDAVAccount[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('caldav_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get calendars for account
  async getCalendars(accountId: string): Promise<CalDAVCalendar[]> {
    const { data, error } = await supabase
      .from('caldav_calendars')
      .select('*')
      .eq('account_id', accountId)
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Sync events from CalDAV to local appointments
  async syncEventsFromCalDAV(calendarId: string): Promise<void> {
    const { data: calendar } = await supabase
      .from('caldav_calendars')
      .select('*, caldav_accounts(*)')
      .eq('id', calendarId)
      .single();

    if (!calendar || !calendar.caldav_accounts) return;

    const client = await this.createDAVClient(calendar.caldav_accounts);
    
    // Mock sync for now - replace with actual CalDAV sync
    console.log(`Syncing events from CalDAV calendar: ${calendar.display_name}`);
    
    // Update last sync time
    await supabase
      .from('caldav_calendars')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', calendarId);
  }

  // Sync appointment to CalDAV calendar
  async syncAppointmentToCalDAV(appointment: any, calendarId: string): Promise<void> {
    const { data: calendar } = await supabase
      .from('caldav_calendars')
      .select('*, caldav_accounts(*)')
      .eq('id', calendarId)
      .single();

    if (!calendar || !calendar.caldav_accounts || calendar.read_only) return;

    const client = await this.createDAVClient(calendar.caldav_accounts);

    // Mock sync for now - replace with actual CalDAV sync
    console.log(`Syncing appointment ${appointment.id} to CalDAV calendar: ${calendar.display_name}`);
  }

  // Simple iCalendar parser (replace with proper iCal library in production)
  private parseSimpleVEvent(icalData: string): CalDAVEvent | null {
    try {
      const lines = icalData.split('\n');
      const event: any = {};

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        switch (key) {
          case 'UID':
            event.uid = value;
            break;
          case 'SUMMARY':
            event.summary = value;
            break;
          case 'DESCRIPTION':
            event.description = value;
            break;
          case 'DTSTART':
            event.start = this.parseICalDate(value);
            break;
          case 'DTEND':
            event.end = this.parseICalDate(value);
            break;
          case 'LOCATION':
            event.location = value;
            break;
        }
      }

      if (event.uid && event.summary && event.start && event.end) {
        return event as CalDAVEvent;
      }
    } catch (error) {
      console.error('Failed to parse iCal data:', error);
    }

    return null;
  }

  // Simple iCalendar creator
  private createSimpleVEvent(appointment: any): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const start = new Date(appointment.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(appointment.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//InteriorApp//CalDAV Sync//EN',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@interiorapp.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${appointment.title}`,
      appointment.description ? `DESCRIPTION:${appointment.description}` : '',
      appointment.location ? `LOCATION:${appointment.location}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
  }

  // Parse iCal date format
  private parseICalDate(dateStr: string): string {
    // Handle basic YYYYMMDDTHHMMSSZ format
    if (dateStr.length === 16 && dateStr.endsWith('Z')) {
      const year = dateStr.substr(0, 4);
      const month = dateStr.substr(4, 2);
      const day = dateStr.substr(6, 2);
      const hour = dateStr.substr(9, 2);
      const minute = dateStr.substr(11, 2);
      const second = dateStr.substr(13, 2);
      
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    }

    // Return as-is for other formats (fallback)
    return dateStr;
  }

  // Remove account
  async removeAccount(accountId: string): Promise<void> {
    const { error } = await supabase
      .from('caldav_accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;

    // Remove client from cache
    this.clients.delete(accountId);
  }

  // Update account sync settings
  async updateAccount(accountId: string, updates: Partial<CalDAVAccount>): Promise<void> {
    const { error } = await supabase
      .from('caldav_accounts')
      .update(updates)
      .eq('id', accountId);

    if (error) throw error;

    // Refresh client if credentials changed
    if (updates.password_encrypted || updates.username || updates.server_url) {
      this.clients.delete(accountId);
    }
  }

  // Update calendar sync settings
  async updateCalendar(calendarId: string, updates: Partial<CalDAVCalendar>): Promise<void> {
    const { error } = await supabase
      .from('caldav_calendars')
      .update(updates)
      .eq('id', calendarId);

    if (error) throw error;
  }
}

export const caldavService = new CalDAVService();