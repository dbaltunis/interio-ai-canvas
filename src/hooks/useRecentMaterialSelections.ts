import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecentSelection {
  itemId: string;
  name: string;
  imageUrl?: string;
  color?: string;
  priceGroup?: string;
  vendorName?: string;
  selectedAt: number;
}

const STORAGE_KEY_PREFIX = 'recent_material_selections';
const MAX_ITEMS = 6;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useRecentMaterialSelections = (limit = MAX_ITEMS) => {
  const [items, setItems] = useState<RecentSelection[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user ID on mount for account-specific storage
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Account-specific storage key - prevents cross-account data leakage
  const storageKey = userId 
    ? `${STORAGE_KEY_PREFIX}_${userId}` 
    : null; // Don't access storage until we have user ID

  // Load from localStorage when user ID is available
  useEffect(() => {
    if (!storageKey) return;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: RecentSelection[] = JSON.parse(stored);
        // Filter out expired entries
        const now = Date.now();
        const valid = parsed.filter(item => now - item.selectedAt < MAX_AGE_MS);
        setItems(valid.slice(0, limit));
      }
    } catch (e) {
      console.error('Failed to load recent selections:', e);
    }
  }, [storageKey, limit]);

  // Add a new selection
  const addSelection = useCallback((item: {
    id: string;
    name: string;
    image_url?: string;
    color?: string;
    price_group?: string;
    vendor?: { name?: string };
    supplier?: string;
  }) => {
    if (!storageKey) return; // Don't persist without user ID
    
    setItems(prev => {
      // Remove existing entry for this item if present
      const filtered = prev.filter(s => s.itemId !== item.id);
      
      // Add new entry at the beginning
      const newEntry: RecentSelection = {
        itemId: item.id,
        name: item.name,
        imageUrl: item.image_url,
        color: item.color,
        priceGroup: item.price_group,
        vendorName: item.vendor?.name || item.supplier,
        selectedAt: Date.now()
      };
      
      const updated = [newEntry, ...filtered].slice(0, MAX_ITEMS);
      
      // Persist to localStorage with account-specific key
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent selections:', e);
      }
      
      return updated;
    });
  }, [storageKey]);

  // Clear all history for current account
  const clearHistory = useCallback(() => {
    if (!storageKey) return;
    
    setItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to clear recent selections:', e);
    }
  }, [storageKey]);

  // Get relative time string
  const getRelativeTime = useCallback((timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  return {
    items,
    addSelection,
    clearHistory,
    getRelativeTime,
    isReady: !!storageKey // Indicates if storage is ready (user ID loaded)
  };
};
