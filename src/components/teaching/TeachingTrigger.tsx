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
  autoShowDelay = 100,
}: TeachingTriggerProps) => {
  const { 
    activeTeaching, 
    isDismissedForever, 
    isSessionDismissed,
    completeTeaching, 
    dismissForever,
    showTeaching,
    isTeachingEnabled,
  } = useTeaching();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const teachingPoint = allTeachingPoints.find(tp => tp.id === teachingId);
  
  // Auto-show on mount if conditions are met - only trigger once
  useEffect(() => {
    if (!autoShow || !isTeachingEnabled || !teachingPoint || hasTriggered) return;
    // Check both permanent and session dismissals
    if (isDismissedForever(teachingId) || isSessionDismissed(teachingId)) return;
    
    // Immediate show if delay is 0
    if (autoShowDelay === 0) {
      setHasTriggered(true);
      showTeaching(teachingId);
      return;
    }
    
    const timer = setTimeout(() => {
      setHasTriggered(true);
      showTeaching(teachingId);
    }, autoShowDelay);
    
    return () => clearTimeout(timer);
  }, [teachingId, autoShow, autoShowDelay, isTeachingEnabled, teachingPoint, hasTriggered, isDismissedForever, isSessionDismissed, showTeaching]);
  
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
      showDontShowAgain={true}
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
