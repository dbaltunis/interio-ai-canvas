import { Skeleton } from "@/components/ui/skeleton";

export const CalendarSkeleton = () => {
  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Skeleton - Compact toolbar */}
        <div className="sticky top-0 z-20 border-b border-border/40 bg-background flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
            {/* Left section - Navigation controls */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-14 rounded-md" /> {/* Today button */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Prev button */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Next button */}
              <Skeleton className="h-4 w-28 ml-1" /> {/* Month/Year */}
            </div>
            
            <div className="flex-1" />
            
            {/* Right section - Controls */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-28 rounded-md" /> {/* Appointment Scheduling */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Filters */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Calendar picker */}
              <Skeleton className="h-7 w-20 rounded-md" /> {/* View selector */}
            </div>
          </div>
        </div>

        {/* Calendar Content Skeleton */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Week view skeleton */}
          <div className="h-full flex flex-col pt-2">
            {/* Week header with dates - Sticky */}
            <div className="flex border-b border-border/40 bg-background flex-shrink-0 sticky top-0 z-10">
              <div className="w-12 border-r border-border/30 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-1.5 text-center border-r border-border/30">
                      <Skeleton className="h-2.5 w-6 mx-auto mb-1" />
                      <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Time grid skeleton - Compact rows */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background pb-24">
              <div className="flex bg-background">
                {/* Time labels column */}
                <div className="w-12 border-r border-border/30 bg-background flex-shrink-0">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div 
                      key={index} 
                      className="h-[32px] px-1.5 text-xs flex items-start justify-end pt-0.5 border-b border-border/20"
                    >
                      <Skeleton className="h-2 w-6" />
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid skeleton */}
                <div className="flex-1 relative bg-background">
                  {/* Hour separation lines */}
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-t border-border/20 pointer-events-none"
                      style={{ top: `${index * 32}px` }}
                    />
                  ))}
                  
                  <div className="grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="relative border-r border-border/30 min-h-[768px]">
                        {/* Sample event skeletons - Compact */}
                        {dayIndex % 2 === 0 && (
                          <Skeleton 
                            className="absolute left-0.5 right-0.5 rounded-md"
                            style={{ 
                              top: `${150 + dayIndex * 20}px`, 
                              height: '48px' 
                            }}
                          />
                        )}
                        {dayIndex % 3 === 0 && (
                          <Skeleton 
                            className="absolute left-0.5 right-0.5 rounded-md"
                            style={{ 
                              top: `${350 + dayIndex * 15}px`, 
                              height: '36px' 
                            }}
                          />
                        )}
                        {(dayIndex + 1) % 4 === 0 && (
                          <Skeleton 
                            className="absolute left-0.5 right-0.5 rounded-md"
                            style={{ 
                              top: `${550 + dayIndex * 10}px`, 
                              height: '60px' 
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
