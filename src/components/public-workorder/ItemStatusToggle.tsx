import React, { useState } from 'react';
import { Circle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export type ItemStatus = 'pending' | 'measured' | 'in_production' | 'ready' | 'installed';
export type DocumentType = 'work_order' | 'installation' | 'fitting';

interface ItemStatusToggleProps {
  itemId: string;
  currentStatus: ItemStatus;
  canEdit: boolean;
  documentType?: DocumentType;
  onStatusChange?: (itemId: string, newStatus: ItemStatus) => void;
}

export const ItemStatusToggle: React.FC<ItemStatusToggleProps> = ({
  itemId,
  currentStatus,
  canEdit,
  documentType = 'work_order',
  onStatusChange,
}) => {
  const [status, setStatus] = useState<ItemStatus>(currentStatus || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ItemStatus) => {
    if (!canEdit || isUpdating) return;

    // Toggle logic: if already at this status, go back to pending
    const targetStatus = status === newStatus ? 'pending' : newStatus;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('workshop_items')
        .update({ status: targetStatus })
        .eq('id', itemId);

      if (error) throw error;

      setStatus(targetStatus);
      onStatusChange?.(itemId, targetStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine what action is relevant based on document type
  const getContextualAction = () => {
    switch (documentType) {
      case 'installation':
        return { targetStatus: 'installed' as ItemStatus, label: 'Installed', activeColor: 'text-green-600' };
      case 'fitting':
        return { targetStatus: 'measured' as ItemStatus, label: 'Measured', activeColor: 'text-blue-600' };
      default:
        return null; // Full workflow for work_order
    }
  };

  const contextualAction = getContextualAction();

  // If can't edit, just show current status as a badge
  if (!canEdit) {
    return <ItemStatusBadge status={status} documentType={documentType} />;
  }

  // Loading state
  if (isUpdating) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  // For installation/fitting docs: Simple checkbox toggle
  if (contextualAction) {
    const isComplete = status === contextualAction.targetStatus || 
      (documentType === 'fitting' && status === 'installed'); // Measured counts if installed
    
    return (
      <button
        onClick={() => handleStatusChange(contextualAction.targetStatus)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all",
          "hover:bg-muted/50 active:scale-95",
          isComplete 
            ? "border-green-200 bg-green-50" 
            : "border-muted bg-background"
        )}
      >
        {isComplete ? (
          <CheckCircle className={cn("h-4 w-4", contextualAction.activeColor)} />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={cn(
          "text-sm font-medium",
          isComplete ? contextualAction.activeColor : "text-muted-foreground"
        )}>
          {contextualAction.label}
        </span>
      </button>
    );
  }

  // For work_order: Show full workflow as progress steps (simplified)
  return (
    <div className="flex items-center gap-1">
      <StatusStep 
        label="Measured" 
        isActive={['measured', 'in_production', 'ready', 'installed'].includes(status)}
        onClick={() => handleStatusChange('measured')}
        color="blue"
      />
      <span className="text-muted-foreground">→</span>
      <StatusStep 
        label="Installed" 
        isActive={status === 'installed'}
        onClick={() => handleStatusChange('installed')}
        color="green"
      />
    </div>
  );
};

// Simple step button for workflow
const StatusStep: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: 'blue' | 'green' | 'orange' | 'purple';
}> = ({ label, isActive, onClick, color }) => {
  const colorClasses = {
    blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : '',
    green: isActive ? 'bg-green-100 text-green-700 border-green-200' : '',
    orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-200' : '',
    purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : '',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 text-xs rounded border transition-all",
        "hover:bg-muted/50 active:scale-95",
        isActive ? colorClasses[color] : "bg-muted/30 text-muted-foreground border-transparent"
      )}
    >
      {label}
    </button>
  );
};

// Display-only status badge
export const ItemStatusBadge: React.FC<{ 
  status: ItemStatus;
  documentType?: DocumentType;
}> = ({ status, documentType = 'work_order' }) => {
  // For installation docs, simplify to just "Installed" or "Pending"
  if (documentType === 'installation') {
    const isInstalled = status === 'installed';
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border",
        isInstalled 
          ? "bg-green-50 text-green-600 border-green-200" 
          : "bg-muted text-muted-foreground border-transparent"
      )}>
        {isInstalled ? <CheckCircle className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
        <span>{isInstalled ? 'Installed' : 'Pending'}</span>
      </div>
    );
  }

  // For fitting docs, simplify to "Measured" or "Pending"
  if (documentType === 'fitting') {
    const isMeasured = status === 'measured' || status === 'installed';
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border",
        isMeasured 
          ? "bg-blue-50 text-blue-600 border-blue-200" 
          : "bg-muted text-muted-foreground border-transparent"
      )}>
        {isMeasured ? <CheckCircle className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
        <span>{isMeasured ? 'Measured' : 'Pending'}</span>
      </div>
    );
  }

  // Full status for work_order
  const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-muted-foreground', bgColor: 'bg-muted' },
    measured: { label: 'Measured', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
    in_production: { label: 'In Production', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
    ready: { label: 'Ready', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
    installed: { label: 'Installed', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border",
      config.bgColor,
      config.color
    )}>
      <span>{config.label}</span>
    </div>
  );
};

// Utility to filter out auto-generated notes for public display
export const filterInternalNotes = (notes: string | null | undefined): string | undefined => {
  if (!notes) return undefined;
  if (notes.startsWith('Auto-generated')) return undefined;
  if (notes.includes('[Internal]')) return undefined;
  return notes;
};
