import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Lightbulb, ChevronRight } from 'lucide-react';
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
  const retryCountRef = useRef(0);

  // Track route changes - only when logged in
  useEffect(() => {
    if (!user) return;
    
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const jobId = searchParams.get('jobId');
    
    // Map routes to teaching pages/sections
    let page = path;
    let section: string | undefined;
    
    if (path === '/' || path === '/app') {
      page = '/app';
      // If job details panel is open, use 'job-details' section
      section = jobId ? 'job-details' : (tab || 'dashboard');
    } else if (path === '/settings') {
      section = searchParams.get('section') || 'personal';
    }
    
    console.log('[Teaching] Route changed:', { path, page, section, tab, jobId });
    
    // Delay to let page render
    setTimeout(() => {
      setCurrentPage(page, section);
    }, 1000);
  }, [location.pathname, location.search, setCurrentPage, user]);

  // Position the bubble near target element with retry logic
  useEffect(() => {
    if (!activeTeaching || !isTeachingEnabled) {
      setPosition(null);
      retryCountRef.current = 0;
      return;
    }

    const positionBubble = () => {
      let targetEl: Element | null = null;
      
      // Try to find target element
      if (activeTeaching.targetSelector) {
        targetEl = document.querySelector(activeTeaching.targetSelector);
      }
      
      // If no target element found, retry or give up
      if (!targetEl) {
        if (activeTeaching.targetSelector) {
          // Element not found yet - retry after a delay (up to 5 times)
          if (retryCountRef.current < 5) {
            retryCountRef.current++;
            console.log(`[Teaching] Target not found, retry ${retryCountRef.current}/5:`, activeTeaching.targetSelector);
            setTimeout(positionBubble, 300);
            return;
          }
          // Target selector defined but element not found after retries - hide the bubble
          console.log('[Teaching] Target not found after retries, hiding bubble');
          setPosition(null);
          return;
        }
        
        // Only show centered if explicitly no target selector defined
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        setPosition({
          top: viewportHeight * 0.3,
          left: Math.min(viewportWidth - 340, viewportWidth * 0.6),
          arrowPosition: 'none',
        });
        return;
      }

      // Reset retry count on success
      retryCountRef.current = 0;

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
    retryCountRef.current = 0;
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

  const bubble = (
    <div
      ref={bubbleRef}
      className={cn(
        "fixed z-[9999] w-80 rounded-xl border-2 border-primary/20 bg-popover text-popover-foreground shadow-xl",
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
            "absolute w-3 h-3 bg-popover rotate-45 border-primary/20",
            position.arrowPosition === 'bottom' && "-top-1.5 left-1/2 -translate-x-1/2 border-t-2 border-l-2",
            position.arrowPosition === 'top' && "-bottom-1.5 left-1/2 -translate-x-1/2 border-b-2 border-r-2",
            position.arrowPosition === 'left' && "-right-1.5 top-1/2 -translate-y-1/2 border-t-2 border-r-2",
            position.arrowPosition === 'right' && "-left-1.5 top-1/2 -translate-y-1/2 border-b-2 border-l-2"
          )}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{activeTeaching.title}</h4>
            {stepInfo && (
              <span className="text-xs text-muted-foreground">
                Step {stepInfo.current} of {stepInfo.total}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {activeTeaching.description}
        </p>
      </div>

      {/* Actions - Only "Got it" button */}
      <div className="flex items-center justify-end border-t border-border px-4 py-3">
        <Button
          size="sm"
          onClick={handleDismiss}
          className="h-8"
        >
          {hasNext ? 'Next' : 'Got it'}
          {hasNext && <ChevronRight className="h-3 w-3 ml-1" />}
        </Button>
      </div>
    </div>
  );

  return createPortal(bubble, document.body);
};
