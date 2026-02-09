// Event type visual configuration used across calendar views

export interface EventTypeConfig {
  label: string;
  defaultColor: string;
  icon: string; // lucide icon name
}

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  meeting: { label: 'Meeting', defaultColor: '#3B82F6', icon: 'Users' },
  consultation: { label: 'Consultation', defaultColor: '#22C55E', icon: 'MessageSquare' },
  installation: { label: 'Installation', defaultColor: '#F59E0B', icon: 'Wrench' },
  measurement: { label: 'Measurement', defaultColor: '#8B5CF6', icon: 'Ruler' },
  'follow-up': { label: 'Follow-up', defaultColor: '#06B6D4', icon: 'RefreshCw' },
  call: { label: 'Call', defaultColor: '#EF4444', icon: 'Phone' },
  reminder: { label: 'Reminder', defaultColor: '#F97316', icon: 'Bell' },
};

export const getEventTypeConfig = (type?: string): EventTypeConfig | null => {
  if (!type) return null;
  return EVENT_TYPES[type] || null;
};

export const getDefaultColorForType = (type?: string): string => {
  if (!type) return '#6366F1';
  return EVENT_TYPES[type]?.defaultColor || '#6366F1';
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPES).map(([value, config]) => ({
  value,
  label: config.label,
  color: config.defaultColor,
}));
