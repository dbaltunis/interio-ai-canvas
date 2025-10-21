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
  { id: 'total', label: 'Total', visible: true, order: 2 },
  { id: 'status', label: 'Status', visible: true, order: 3 },
  { id: 'created', label: 'Created', visible: true, order: 4 },
  { id: 'emails', label: 'Emails', visible: true, order: 5 },
  { id: 'team', label: 'Team', visible: true, order: 6 },
  { id: 'actions', label: 'Actions', visible: true, order: 7, locked: true },
];

const STORAGE_KEY = 'jobs-table-columns';

export const useColumnPreferences = () => {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setColumns(parsed);
      } catch (error) {
        console.error('Failed to parse column preferences:', error);
      }
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
