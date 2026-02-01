import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean; // Some columns like Job No and Actions should not be removable
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'job_no', label: 'Job No', visible: true, order: 0, locked: true },
  { id: 'client', label: 'Client', visible: true, order: 1 },
  { id: 'area', label: 'Area', visible: false, order: 2 },
  { id: 'total', label: 'Total', visible: true, order: 3 },
  { id: 'advance', label: 'Advance', visible: true, order: 4 },
  { id: 'balance', label: 'Balance', visible: true, order: 5 },
  { id: 'start_date', label: 'Start Date', visible: false, order: 6 },
  { id: 'due_date', label: 'Due Date', visible: false, order: 7 },
  { id: 'status', label: 'Status', visible: true, order: 8 },
  { id: 'created', label: 'Created', visible: true, order: 9 },
  { id: 'emails', label: 'Messages', visible: true, order: 10 },
  { id: 'team', label: 'Team', visible: true, order: 11 },
  { id: 'actions', label: 'Actions', visible: true, order: 12, locked: true },
];

// Version key to trigger migration when columns change
const STORAGE_KEY = 'jobs-table-columns';
const STORAGE_VERSION_KEY = 'jobs-table-columns-version';
const CURRENT_VERSION = 2; // Increment when adding new columns

// Merge new columns into existing saved preferences
const migrateColumns = (savedColumns: ColumnConfig[]): ColumnConfig[] => {
  const savedIds = new Set(savedColumns.map(c => c.id));
  const defaultIds = new Set(DEFAULT_COLUMNS.map(c => c.id));
  
  // Find new columns that don't exist in saved preferences
  const newColumns = DEFAULT_COLUMNS.filter(col => !savedIds.has(col.id));
  
  // Find columns that were removed from defaults (keep them for backwards compatibility)
  const retainedColumns = savedColumns.filter(col => defaultIds.has(col.id));
  
  if (newColumns.length === 0) {
    return savedColumns;
  }
  
  // Append new columns at the end (before 'actions' if it exists)
  const actionsIndex = retainedColumns.findIndex(c => c.id === 'actions');
  const maxOrder = Math.max(...retainedColumns.map(c => c.order), 0);
  
  const newColumnsWithOrder = newColumns.map((col, idx) => ({
    ...col,
    order: maxOrder + 1 + idx,
  }));
  
  if (actionsIndex >= 0) {
    // Insert before actions
    const result = [
      ...retainedColumns.slice(0, actionsIndex),
      ...newColumnsWithOrder,
      ...retainedColumns.slice(actionsIndex),
    ];
    // Re-index orders
    return result.map((col, idx) => ({ ...col, order: idx }));
  }
  
  return [...retainedColumns, ...newColumnsWithOrder].map((col, idx) => ({ ...col, order: idx }));
};

export const useColumnPreferences = () => {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Load preferences from localStorage on mount with migration
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (savedPreferences) {
      try {
        let parsed = JSON.parse(savedPreferences);
        
        // Migrate if version is outdated or missing
        if (!savedVersion || parseInt(savedVersion) < CURRENT_VERSION) {
          parsed = migrateColumns(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
        }
        
        setColumns(parsed);
      } catch (error) {
        console.error('Failed to parse column preferences:', error);
      }
    } else {
      // First time user - set version
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    }
  }, []);

  // Save preferences to localStorage
  const saveColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newColumns));
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    const newColumns = columns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    saveColumns(newColumns);
  };

  // Reorder columns
  const reorderColumns = (startIndex: number, endIndex: number) => {
    const newColumns = Array.from(columns);
    const [removed] = newColumns.splice(startIndex, 1);
    newColumns.splice(endIndex, 0, removed);
    
    // Update order property
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index
    }));
    
    saveColumns(updatedColumns);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    saveColumns(DEFAULT_COLUMNS);
  };

  // Get visible columns sorted by order
  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  return {
    columns,
    visibleColumns,
    toggleColumn,
    reorderColumns,
    resetToDefaults,
  };
};
