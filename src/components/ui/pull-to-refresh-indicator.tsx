import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  progress: number;
  pullDistance: number;
}

export function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  progress,
  pullDistance
}: PullToRefreshIndicatorProps) {
  const opacity = Math.min(progress, 1);
  const scale = Math.min(0.5 + progress * 0.5, 1);
  
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200 pointer-events-none",
        "lg:hidden" // Only show on mobile
      )}
      style={{
        height: `${Math.min(pullDistance, 80)}px`,
        opacity: opacity
      }}
    >
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm"
        style={{
          transform: `scale(${scale}) rotate(${isRefreshing ? '0deg' : progress * 360}deg)`,
          transition: isRefreshing ? 'transform 0.3s ease' : 'none'
        }}
      >
        {isRefreshing ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>
    </div>
  );
}
