import React, { useEffect, useState } from 'react';
import { useTeaching } from '@/contexts/TeachingContext';
import { TeachingPopover } from './TeachingPopover';
import { allTeachingPoints, TeachingPoint } from '@/config/teachingPoints';

interface TeachingTriggerProps {
  teachingId: string;
  children: React.ReactNode;
  /** Override the teaching point's default position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Show teaching on mount if conditions are met */
  autoShow?: boolean;
  /** Delay before auto-showing (ms) */
  autoShowDelay?: number;
}

/**
 * Wrap any element with TeachingTrigger to attach a teaching popover.
 * The teaching will show based on the trigger conditions defined in teachingPoints.ts
 * 
 * Usage:
 * ```tsx
 * <TeachingTrigger teachingId="settings-business-logo">
 *   <Button>Upload Logo</Button>
 * </TeachingTrigger>
 * ```
 */
export const TeachingTrigger = ({
  teachingId,
  children,
  position,
  autoShow = true,
  autoShowDelay = 500,
}: TeachingTriggerProps) => {
  const { 
    activeTeaching, 
    hasSeenTeaching, 
    isDismissedForever, 
    completeTeaching, 
    dismissForever,
    showTeaching,
    isTeachingEnabled,
  } = useTeaching();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const teachingPoint = allTeachingPoints.find(tp => tp.id === teachingId);
  
  // Auto-show on mount if conditions are met
  useEffect(() => {
    if (!autoShow || !isTeachingEnabled || !teachingPoint) return;
    if (hasSeenTeaching(teachingId) || isDismissedForever(teachingId)) return;
    
    const timer = setTimeout(() => {
      // Only show if this teaching is the active one or no active teaching
      if (!activeTeaching || activeTeaching.id === teachingId) {
        showTeaching(teachingId);
      }
    }, autoShowDelay);
    
    return () => clearTimeout(timer);
  }, [teachingId, autoShow, autoShowDelay, isTeachingEnabled, teachingPoint, hasSeenTeaching, isDismissedForever, activeTeaching, showTeaching]);
  
  // Sync with context's active teaching
  useEffect(() => {
    setIsOpen(activeTeaching?.id === teachingId);
  }, [activeTeaching, teachingId]);
  
  if (!teachingPoint) {
    console.warn(`Teaching point not found: ${teachingId}`);
    return <>{children}</>;
  }
  
  const handleDismiss = () => {
    completeTeaching(teachingId);
  };
  
  const handleDismissForever = () => {
    dismissForever(teachingId);
  };
  
  // Get step info if part of a sequence
  const getStepInfo = (): { current: number; total: number } | undefined => {
    if (!teachingPoint.sequence || !teachingPoint.sequenceOrder) return undefined;
    
    const sequencePoints = allTeachingPoints.filter(
      tp => tp.sequence === teachingPoint.sequence
    );
    
    return {
      current: teachingPoint.sequenceOrder,
      total: sequencePoints.length,
    };
  };
  
  return (
    <TeachingPopover
      id={teachingId}
      title={teachingPoint.title}
      description={teachingPoint.description}
      position={position || teachingPoint.position}
      step={getStepInfo()}
      onDismiss={handleDismiss}
      onDismissForever={handleDismissForever}
      open={isOpen}
      primaryAction={{
        label: getStepInfo() && getStepInfo()!.current < getStepInfo()!.total ? 'Next' : 'Got it',
        onClick: handleDismiss,
      }}
    >
      {children}
    </TeachingPopover>
  );
};

/**
 * Hook to manually control teaching visibility
 */
export const useTeachingTrigger = (teachingId: string) => {
  const { 
    showTeaching, 
    dismissTeaching, 
    hasSeenTeaching, 
    isDismissedForever,
    activeTeaching,
  } = useTeaching();
  
  const isActive = activeTeaching?.id === teachingId;
  const canShow = !hasSeenTeaching(teachingId) && !isDismissedForever(teachingId);
  
  return {
    isActive,
    canShow,
    show: () => showTeaching(teachingId),
    dismiss: () => dismissTeaching(teachingId),
  };
};
