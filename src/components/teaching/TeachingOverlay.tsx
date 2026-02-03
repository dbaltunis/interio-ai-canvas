import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeaching } from '@/contexts/TeachingContext';
import { allTeachingPoints, getNextInSequence } from '@/config/teachingPoints';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * Global teaching overlay that renders floating teaching bubbles
 * pointing to target elements based on CSS selectors.
 */
export const TeachingOverlay = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    activeTeaching, 
    completeTeaching, 
    dismissForever,
    setCurrentPage,
    hasSeenTeaching,
    isDismissedForever,
    isTeachingEnabled,
    progress,
  } = useTeaching();
  
  const [position, setPosition] = useState<{ top: number; left: number; arrowPosition: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Track route changes - only when logged in
  useEffect(() => {
    if (!user) return;
    
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    // Map routes to teaching pages/sections
    let page = path;
    let section: string | undefined;
    
    if (path === '/' || path === '/app') {
      page = '/app';
      section = tab || 'dashboard';
    } else if (path === '/settings') {
      section = searchParams.get('section') || 'personal';
    }
    
    console.log('[Teaching] Route changed:', { path, page, section, tab });
    
    // Delay to let page render
    setTimeout(() => {
      setCurrentPage(page, section);
    }, 1000);
  }, [location.pathname, location.search, setCurrentPage, user]);

  // Position the bubble near target element
  useEffect(() => {
    if (!activeTeaching || !isTeachingEnabled) {
      setPosition(null);
      return;
    }

    const positionBubble = () => {
      let targetEl: Element | null = null;
      
      // Try to find target element
      if (activeTeaching.targetSelector) {
        targetEl = document.querySelector(activeTeaching.targetSelector);
      }
      
      // If no target element found, DON'T show the bubble at all
      // This prevents floating tips in random positions
      if (!targetEl) {
        // Only show centered if explicitly no target selector defined
        if (!activeTeaching.targetSelector) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          setPosition({
            top: viewportHeight * 0.3,
            left: Math.min(viewportWidth - 340, viewportWidth * 0.6),
            arrowPosition: 'none',
          });
        } else {
          // Target selector defined but element not found - hide the bubble
          setPosition(null);
        }
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      const bubbleWidth = 320;
      const bubbleHeight = 180;
      const offset = 12;
      
      let top = 0;
      let left = 0;
      let arrowPosition = activeTeaching.position;

      switch (activeTeaching.position) {
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - bubbleWidth / 2;
          break;
        case 'top':
          top = rect.top - bubbleHeight - offset;
          left = rect.left + rect.width / 2 - bubbleWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - bubbleHeight / 2;
          left = rect.left - bubbleWidth - offset;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - bubbleHeight / 2;
          left = rect.right + offset;
          break;
      }

      // Keep within viewport
      const padding = 16;
      left = Math.max(padding, Math.min(left, window.innerWidth - bubbleWidth - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - bubbleHeight - padding));

      setPosition({ top, left, arrowPosition });
    };

    // Initial positioning
    const timer = setTimeout(positionBubble, 100);
    
    // Reposition on scroll/resize
    window.addEventListener('scroll', positionBubble, true);
    window.addEventListener('resize', positionBubble);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', positionBubble, true);
      window.removeEventListener('resize', positionBubble);
    };
  }, [activeTeaching, isTeachingEnabled]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeTeaching || !position || !isTeachingEnabled || !user) {
    return null;
  }

  // Skip rendering if this teaching is handled by component-level TeachingTrigger
  if (activeTeaching.skipAutoShow) {
    return null;
  }

  // Get step info if part of a sequence
  const getStepInfo = (): { current: number; total: number } | undefined => {
    if (!activeTeaching.sequence || !activeTeaching.sequenceOrder) return undefined;
    
    const sequencePoints = allTeachingPoints.filter(
      tp => tp.sequence === activeTeaching.sequence
    );
    
    return {
      current: activeTeaching.sequenceOrder,
      total: sequencePoints.length,
    };
  };

  const stepInfo = getStepInfo();
  const hasNext = stepInfo && stepInfo.current < stepInfo.total;

  const handleDismiss = () => {
    completeTeaching(activeTeaching.id);
  };

  const handleDismissForever = () => {
    dismissForever(activeTeaching.id);
  };

  const bubble = (
    <div
      ref={bubbleRef}
      className={cn(
        "fixed z-[9999] w-80 rounded-lg border border-primary/20 bg-primary text-primary-foreground shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Arrow */}
      {position.arrowPosition !== 'none' && (
        <div
          className={cn(
            "absolute w-3 h-3 bg-primary rotate-45 border-primary/20",
            position.arrowPosition === 'bottom' && "-top-1.5 left-1/2 -translate-x-1/2 border-t border-l",
            position.arrowPosition === 'top' && "-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r",
            position.arrowPosition === 'left' && "-right-1.5 top-1/2 -translate-y-1/2 border-t border-r",
            position.arrowPosition === 'right' && "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
          )}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{activeTeaching.title}</h4>
            {stepInfo && (
              <span className="text-xs text-primary-foreground/70">
                Step {stepInfo.current} of {stepInfo.total}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-primary-foreground/90 leading-relaxed">
          {activeTeaching.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-primary-foreground/20 px-4 py-3">
        <button
          onClick={handleDismissForever}
          className="text-xs text-primary-foreground/60 hover:text-primary-foreground/80 transition-colors"
        >
          Don't show again
        </button>
        <Button
          size="sm"
          onClick={handleDismiss}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-8"
        >
          {hasNext ? 'Next' : 'Got it'}
          {hasNext && <ChevronRight className="h-3 w-3 ml-1" />}
        </Button>
      </div>
    </div>
  );

  return createPortal(bubble, document.body);
};
