import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'favorite_materials';

export const useFavoriteMaterials = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorite materials:', e);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorite materials:', e);
      }
      
      return updated;
    });
  }, []);

  // Check if an item is favorited
  const isFavorite = useCallback((itemId: string) => {
    return favorites.includes(itemId);
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear favorite materials:', e);
    }
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
};
