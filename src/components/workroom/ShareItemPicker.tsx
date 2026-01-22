import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorkshopItem {
  id: string;
  room_name: string;
  surface_name: string;
  treatment_type: string;
}

interface ShareItemPickerProps {
  projectId: string;
  selectedItems: string[];
  onSelectionChange: (itemIds: string[]) => void;
}

const TREATMENT_LABELS: Record<string, string> = {
  curtains: 'Curtains',
  roman_blinds: 'Roman Blinds',
  roller_blinds: 'Roller Blinds',
  venetian_blinds: 'Venetian Blinds',
  vertical_blinds: 'Vertical Blinds',
  shutters: 'Shutters',
  honeycomb_blinds: 'Honeycomb Blinds',
  panel_blinds: 'Panel Blinds',
  sheer_curtains: 'Sheer Curtains',
};

const formatTreatmentType = (type: string): string => {
  return TREATMENT_LABELS[type] || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const ShareItemPicker: React.FC<ShareItemPickerProps> = ({
  projectId,
  selectedItems,
  onSelectionChange,
}) => {
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [includeAll, setIncludeAll] = useState(true);

  // Fetch workshop items for this project
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('workshop_items')
          .select('id, room_name, surface_name, treatment_type')
          .eq('project_id', projectId)
          .order('room_name', { ascending: true })
          .order('surface_name', { ascending: true });

        if (error) throw error;
        setItems(data || []);
        
        // Expand all rooms by default if there are few
        if (data && data.length <= 10) {
          const rooms = new Set(data.map(item => item.room_name || 'Unassigned'));
          setExpandedRooms(rooms);
        }
      } catch (error) {
        console.error('Error fetching workshop items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchItems();
    }
  }, [projectId]);

  // Group items by room
  const groupedItems = useMemo(() => {
    const groups: Record<string, WorkshopItem[]> = {};
    items.forEach(item => {
      const room = item.room_name || 'Unassigned';
      if (!groups[room]) {
        groups[room] = [];
      }
      groups[room].push(item);
    });
    return groups;
  }, [items]);

  const totalCount = items.length;
  const allItemIds = useMemo(() => items.map(item => item.id), [items]);

  // Handle "All Items" checkbox
  const handleAllChange = (checked: boolean) => {
    setIncludeAll(checked);
    if (checked) {
      onSelectionChange([]);
    }
  };

  // Handle room checkbox
  const handleRoomChange = (roomName: string, checked: boolean) => {
    setIncludeAll(false);
    const roomItemIds = groupedItems[roomName]?.map(item => item.id) || [];
    
    if (checked) {
      const newSelection = [...new Set([...selectedItems, ...roomItemIds])];
      onSelectionChange(newSelection);
    } else {
      const newSelection = selectedItems.filter(id => !roomItemIds.includes(id));
      onSelectionChange(newSelection);
    }
  };

  // Handle individual item checkbox
  const handleItemChange = (itemId: string, checked: boolean) => {
    setIncludeAll(false);
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  // Toggle room expansion
  const toggleRoom = (roomName: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomName)) {
        next.delete(roomName);
      } else {
        next.add(roomName);
      }
      return next;
    });
  };

  // Check if all items in a room are selected
  const isRoomSelected = (roomName: string): boolean => {
    if (includeAll) return true;
    const roomItemIds = groupedItems[roomName]?.map(item => item.id) || [];
    return roomItemIds.length > 0 && roomItemIds.every(id => selectedItems.includes(id));
  };

  // Check if some (but not all) items in a room are selected
  const isRoomIndeterminate = (roomName: string): boolean => {
    if (includeAll) return false;
    const roomItemIds = groupedItems[roomName]?.map(item => item.id) || [];
    const selectedCount = roomItemIds.filter(id => selectedItems.includes(id)).length;
    return selectedCount > 0 && selectedCount < roomItemIds.length;
  };

  // Get selected count for display
  const getSelectedCount = (): number => {
    if (includeAll) return totalCount;
    return selectedItems.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="ml-2 text-xs text-muted-foreground">Loading items...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="text-xs text-muted-foreground">No items found in this project</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Select Items to Share</Label>
      
      <div className="p-2 bg-muted/50 rounded-md max-h-56 overflow-y-auto border border-border/50">
        {/* Select All */}
        <label className="flex items-center gap-2 text-xs cursor-pointer hover:bg-background p-1.5 rounded transition-colors">
          <Checkbox
            checked={includeAll}
            onCheckedChange={handleAllChange}
            className="h-3.5 w-3.5"
          />
          <span className="font-medium text-foreground">All Items ({totalCount})</span>
        </label>

        {/* Rooms */}
        <div className="mt-1 space-y-0.5">
          {Object.entries(groupedItems).map(([roomName, roomItems]) => (
            <Collapsible
              key={roomName}
              open={expandedRooms.has(roomName)}
              onOpenChange={() => toggleRoom(roomName)}
            >
              <div className="flex items-center gap-1">
                <CollapsibleTrigger className="p-1 hover:bg-background rounded transition-colors">
                  {expandedRooms.has(roomName) ? (
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                
                <label className={`flex items-center gap-2 text-xs cursor-pointer flex-1 p-1 rounded transition-colors ${
                  includeAll ? 'opacity-50' : 'hover:bg-background'
                }`}>
                  <Checkbox
                    checked={isRoomSelected(roomName)}
                    onCheckedChange={(checked) => handleRoomChange(roomName, !!checked)}
                    disabled={includeAll}
                    className="h-3.5 w-3.5"
                    data-state={isRoomIndeterminate(roomName) ? 'indeterminate' : undefined}
                  />
                  <span className="font-medium text-foreground">{roomName}</span>
                  <span className="text-muted-foreground">({roomItems.length})</span>
                </label>
              </div>

              <CollapsibleContent className="pl-7 space-y-0.5">
                {roomItems.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 text-xs cursor-pointer p-1 rounded transition-colors ${
                      includeAll ? 'opacity-50' : 'hover:bg-background'
                    }`}
                  >
                    <Checkbox
                      checked={includeAll || selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemChange(item.id, !!checked)}
                      disabled={includeAll}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-foreground truncate">
                      {item.surface_name || 'Window'}
                    </span>
                    <span className="text-muted-foreground">
                      — {formatTreatmentType(item.treatment_type)}
                    </span>
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Selected count indicator */}
      {!includeAll && selectedItems.length > 0 && (
        <p className="text-[10px] text-muted-foreground">
          {getSelectedCount()} of {totalCount} items selected
        </p>
      )}
    </div>
  );
};
