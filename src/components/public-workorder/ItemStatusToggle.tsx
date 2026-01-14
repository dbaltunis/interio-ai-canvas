import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Ruler, CheckCircle, Truck, Wrench, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export type ItemStatus = 'pending' | 'measured' | 'in_production' | 'ready' | 'installed';

interface ItemStatusToggleProps {
  itemId: string;
  currentStatus: ItemStatus;
  canEdit: boolean;
  onStatusChange?: (itemId: string, newStatus: ItemStatus) => void;
}

const STATUS_CONFIG: Record<ItemStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { 
    label: 'Pending', 
    icon: Ruler, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  measured: { 
    label: 'Measured', 
    icon: Ruler, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  in_production: { 
    label: 'In Production', 
    icon: Wrench, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  ready: { 
    label: 'Ready', 
    icon: Truck, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  installed: { 
    label: 'Installed', 
    icon: CheckCircle, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
};

export const ItemStatusToggle: React.FC<ItemStatusToggleProps> = ({
  itemId,
  currentStatus,
  canEdit,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<ItemStatus>(currentStatus || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ItemStatus) => {
    if (!canEdit || isUpdating || newStatus === status) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('workshop_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;

      setStatus(newStatus);
      onStatusChange?.(itemId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // If can't edit, just show current status
  if (!canEdit) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs border",
        config.bgColor,
        config.color
      )}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  }

  // Quick status buttons for field workers
  return (
    <div className="flex flex-wrap gap-1">
      {isUpdating && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating...
        </div>
      )}
      
      {!isUpdating && (
        <>
          <Button
            variant={status === 'measured' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "h-7 text-xs gap-1",
              status === 'measured' && 'bg-blue-600 hover:bg-blue-700'
            )}
            onClick={() => handleStatusChange('measured')}
          >
            <Ruler className="h-3 w-3" />
            Measured
          </Button>
          
          <Button
            variant={status === 'installed' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              "h-7 text-xs gap-1",
              status === 'installed' && 'bg-green-600 hover:bg-green-700'
            )}
            onClick={() => handleStatusChange('installed')}
          >
            <CheckCircle className="h-3 w-3" />
            Installed
          </Button>
        </>
      )}
    </div>
  );
};

// Display-only status badge
export const ItemStatusBadge: React.FC<{ status: ItemStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border",
      config.bgColor,
      config.color
    )}>
      <Icon className="h-2.5 w-2.5" />
      <span>{config.label}</span>
    </div>
  );
};
