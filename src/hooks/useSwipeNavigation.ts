import { useEffect, useRef, useCallback } from "react";

interface SwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  edgeWidth?: number; // Only trigger from edge (left X pixels)
  velocityThreshold?: number; // Minimum velocity for swipe
  enabled?: boolean;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  edgeWidth = 40,
  velocityThreshold = 0.3,
  enabled = true
}: SwipeNavigationOptions) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isEdgeSwipe = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    
    // Check if swipe started from left edge
    isEdgeSwipe.current = touch.clientX <= edgeWidth;
  }, [enabled, edgeWidth]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    touchEndX.current = e.touches[0].clientX;
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const timeDiff = Date.now() - touchStartTime.current;
    const velocity = Math.abs(diff) / timeDiff;
    
    // Must exceed threshold AND velocity
    if (Math.abs(diff) > threshold && velocity > velocityThreshold) {
      if (diff > 0 && onSwipeLeft) {
        // Swiped left (forward)
        onSwipeLeft();
      } else if (diff < 0 && isEdgeSwipe.current && onSwipeRight) {
        // Swiped right from edge (back) - native iOS behavior
        onSwipeRight();
      }
    }
    
    // Reset
    isEdgeSwipe.current = false;
  }, [enabled, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
