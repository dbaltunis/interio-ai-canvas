import { Skeleton } from "@/components/ui/skeleton";

export const CalendarSkeleton = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Main Calendar Area - No sidebar for desktop/tablet */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Skeleton - Updated toolbar */}
        <div className="sticky top-0 z-20 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 flex-wrap">
            {/* Left section - Navigation controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <Skeleton className="h-7 w-16 rounded-md" /> {/* Today button */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Prev button */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Next button */}
              <Skeleton className="h-4 w-32 ml-1" /> {/* Month/Year */}
            </div>
            
            <div className="flex-1" />
            
            {/* Right section - Controls */}
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-7 w-32 rounded-md" /> {/* Appointment Scheduling */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Filters */}
              <Skeleton className="h-7 w-7 rounded-md" /> {/* Calendar picker */}
              <Skeleton className="h-7 w-24 rounded-md" /> {/* View selector */}
            </div>
          </div>
        </div>

        {/* Calendar Content Skeleton */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Week view skeleton */}
          <div className="h-full flex flex-col pt-3">
            {/* Week header with dates - Sticky */}
            <div className="flex border-b bg-background flex-shrink-0 sticky top-0 z-10">
              <div className="w-16 border-r flex-shrink-0"></div>
              <div className="flex-1">
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-2 text-center border-r">
                      <Skeleton className="h-3 w-8 mx-auto mb-1" />
                      <Skeleton className="h-7 w-7 mx-auto rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Time grid skeleton - Larger rows */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-card pb-32">
              <div className="flex bg-card">
                {/* Time labels column */}
                <div className="w-16 border-r bg-card flex-shrink-0">
                  {Array.from({ length: 48 }).map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-[32px] px-2 text-xs flex items-center justify-end ${
                        index % 2 === 0 ? 'border-b border-muted/30' : 'border-b border-muted'
                      }`}
                    >
                      {index % 2 === 0 && (
                        <Skeleton className="h-2.5 w-8" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid skeleton */}
                <div className="flex-1 relative bg-card">
                  {/* Hour separation lines */}
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-t border-border/30 pointer-events-none"
                      style={{ top: `${index * 64}px` }}
                    />
                  ))}
                  
                  <div className="grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="relative border-r min-h-[1536px]">
                        {/* Sample event skeletons with better spacing */}
                        {dayIndex % 2 === 0 && (
                          <Skeleton 
                            className="absolute left-1 right-1 rounded-2xl"
                            style={{ 
                              top: `${200 + dayIndex * 30}px`, 
                              height: '80px' 
                            }}
                          />
                        )}
                        {dayIndex % 3 === 0 && (
                          <Skeleton 
                            className="absolute left-1 right-1 rounded-2xl"
                            style={{ 
                              top: `${450 + dayIndex * 25}px`, 
                              height: '64px' 
                            }}
                          />
                        )}
                        {(dayIndex + 1) % 4 === 0 && (
                          <Skeleton 
                            className="absolute left-1 right-1 rounded-2xl"
                            style={{ 
                              top: `${700 + dayIndex * 20}px`, 
                              height: '96px' 
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