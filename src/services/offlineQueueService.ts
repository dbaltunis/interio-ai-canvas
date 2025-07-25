import { supabase } from '@/integrations/supabase/client';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'sync';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineCache {
  appointments: any[];
  calendars: any[];
  accounts: any[];
  lastUpdated: number;
}

class OfflineQueueService {
  private queue: QueuedOperation[] = [];
  private cache: OfflineCache = {
    appointments: [],
    calendars: [],
    accounts: [],
    lastUpdated: 0
  };
  private readonly STORAGE_KEY = 'caldav_offline_queue';
  private readonly CACHE_KEY = 'caldav_offline_cache';
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor() {
    this.loadFromStorage();
    this.setupNetworkListeners();
  }

  private loadFromStorage() {
    try {
      const storedQueue = localStorage.getItem(this.STORAGE_KEY);
      const storedCache = localStorage.getItem(this.CACHE_KEY);
      
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
      }
      
      if (storedCache) {
        this.cache = JSON.parse(storedCache);
      }
    } catch (error) {
      console.error('Failed to load offline data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save offline data to storage:', error);
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network restored, processing offline queue');
      this.processQueue();
    });
  }

  public queueOperation(type: QueuedOperation['type'], table: string, data: any) {
    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(operation);
    this.saveToStorage();
    
    console.log(`Queued ${type} operation for ${table}:`, operation);
  }

  public async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) return;

    const operations = [...this.queue];
    this.queue = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        console.log(`Successfully executed queued operation:`, operation);
      } catch (error) {
        console.error(`Failed to execute queued operation:`, operation, error);
        
        if (operation.retryCount < this.MAX_RETRY_ATTEMPTS) {
          operation.retryCount++;
          this.queue.push(operation);
        } else {
          console.error(`Max retry attempts reached for operation:`, operation);
        }
      }
    }

    this.saveToStorage();
  }

  private async executeOperation(operation: QueuedOperation) {
    const { type, table, data } = operation;

    switch (type) {
      case 'create':
        if (table === 'appointments') {
          await supabase.from('appointments').insert(data);
        }
        break;
      
      case 'update':
        if (table === 'appointments') {
          await supabase.from('appointments').update(data).eq('id', data.id);
        }
        break;
      
      case 'delete':
        if (table === 'appointments') {
          await supabase.from('appointments').delete().eq('id', data.id);
        }
        break;
    }
  }

  public updateCache(type: keyof OfflineCache, data: any[]) {
    if (type !== 'lastUpdated') {
      this.cache[type] = data;
      this.cache.lastUpdated = Date.now();
      this.saveToStorage();
    }
  }

  public getCache(): OfflineCache {
    return this.cache;
  }

  public getCachedData(type: keyof OfflineCache) {
    if (type === 'lastUpdated') {
      return this.cache.lastUpdated;
    }
    return this.cache[type] || [];
  }

  public getQueueStatus() {
    return {
      pendingOperations: this.queue.length,
      operations: this.queue.map(op => ({
        id: op.id,
        type: op.type,
        table: op.table,
        timestamp: op.timestamp,
        retryCount: op.retryCount
      }))
    };
  }

  public clearQueue() {
    this.queue = [];
    this.saveToStorage();
  }

  public isDataStale(maxAgeMs: number = 5 * 60 * 1000) { // 5 minutes default
    return Date.now() - this.cache.lastUpdated > maxAgeMs;
  }
}

export const offlineQueueService = new OfflineQueueService();