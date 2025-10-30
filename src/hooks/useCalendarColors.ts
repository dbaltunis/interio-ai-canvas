import { useState, useEffect } from "react";

export interface CalendarSource {
  id: string;
  name: string;
  type: 'appointments' | 'caldav' | 'scheduler';
  color: string;
  visible: boolean;
}

export interface ColorOption {
  name: string;
  value: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Slate', value: '#415e6b' },
  { name: 'Gray', value: '#9bb6bc' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Purple', value: '#6366F1' },
];

const DEFAULT_COLORS = COLOR_OPTIONS.map(c => c.value);

const STORAGE_KEY = 'calendar-colors';

export const useCalendarColors = () => {
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Initialize default sources if none exist
  useEffect(() => {
    if (calendarSources.length === 0) {
      const defaultSources: CalendarSource[] = [
        {
          id: 'appointments',
          name: 'My Appointments',
          type: 'appointments',
          color: DEFAULT_COLORS[0],
          visible: true,
        },
        {
          id: 'schedulers',
          name: 'Public Schedulers',
          type: 'scheduler',
          color: DEFAULT_COLORS[1],
          visible: true,
        },
      ];
      setCalendarSources(defaultSources);
    }
  }, [calendarSources.length]);

  // Save to localStorage whenever sources change
  useEffect(() => {
    if (calendarSources.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarSources));
    }
  }, [calendarSources]);

  const addCalendarSource = (source: Omit<CalendarSource, 'color'>) => {
    const usedColors = calendarSources.map(s => s.color);
    const availableColor = DEFAULT_COLORS.find(color => !usedColors.includes(color)) || DEFAULT_COLORS[0];
    
    const newSource: CalendarSource = {
      ...source,
      color: availableColor,
    };
    
    setCalendarSources(prev => [...prev, newSource]);
    return newSource;
  };

  const updateCalendarSource = (id: string, updates: Partial<CalendarSource>) => {
    setCalendarSources(prev => 
      prev.map(source => 
        source.id === id ? { ...source, ...updates } : source
      )
    );
  };

  const removeCalendarSource = (id: string) => {
    setCalendarSources(prev => prev.filter(source => source.id !== id));
  };

  const getColorForSource = (sourceId: string, sourceType: CalendarSource['type']) => {
    const source = calendarSources.find(s => s.id === sourceId || s.type === sourceType);
    return source?.color || DEFAULT_COLORS[0];
  };

  const getVisibilityForSource = (sourceId: string, sourceType: CalendarSource['type']) => {
    const source = calendarSources.find(s => s.id === sourceId || s.type === sourceType);
    return source?.visible !== false; // Default to visible if not found
  };

  const toggleSourceVisibility = (id: string) => {
    updateCalendarSource(id, { visible: !calendarSources.find(s => s.id === id)?.visible });
  };

  return {
    calendarSources,
    addCalendarSource,
    updateCalendarSource,
    removeCalendarSource,
    getColorForSource,
    getVisibilityForSource,
    toggleSourceVisibility,
    defaultColors: DEFAULT_COLORS,
    colorOptions: COLOR_OPTIONS,
  };
};