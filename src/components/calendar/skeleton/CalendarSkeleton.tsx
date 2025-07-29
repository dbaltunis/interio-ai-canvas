import { Skeleton } from "@/components/ui/skeleton";

export const CalendarSkeleton = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-72 border-r bg-background p-4 flex-shrink-0">
        {/* Mini calendar skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {/* Calendar grid skeleton */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
          
          {/* Sidebar buttons */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-10 border-b bg-background p-2 md:p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Left section - Title and Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <Skeleton className="h-8 w-20" />
              <div className="flex items-center gap-1 md:gap-2">
                <Skeleton className="h-9 w-16 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-6 w-32 ml-2" />
              </div>
            </div>
            
            {/* Right section - View selector */}
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>

        {/* Calendar Content Skeleton */}
        <div className="flex-1 overflow-hidden min-h-0">
          {/* Week view skeleton */}
          <div className="h-full flex flex-col">
            {/* Week header with days */}
            <div className="flex border-b bg-background sticky top-0 z-10 flex-shrink-0">
              <div className="w-16 border-r flex-shrink-0"></div>
              <div className="flex-1">
                <div className="grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-2 text-center border-r">
                      <Skeleton className="h-4 w-8 mx-auto mb-1" />
                      <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Time grid skeleton */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex">
                {/* Time labels column */}
                <div className="w-16 border-r flex-shrink-0">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className="h-[20px] px-2 text-xs flex items-center justify-end border-b">
                      {index % 2 === 0 && (
                        <Skeleton className="h-3 w-8" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid skeleton */}
                <div className="flex-1 relative">
                  {/* Hour separation lines */}
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0 border-t border-muted/30 pointer-events-none"
                      style={{ top: `${index * 40}px` }}
                    />
                  ))}
                  
                  <div className="grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="relative border-r" style={{ height: '400px' }}>
                        {/* Sample event skeletons */}
                        {dayIndex % 2 === 0 && (
                          <Skeleton 
                            className="absolute left-1 right-1 rounded"
                            style={{ 
                              top: `${60 + dayIndex * 20}px`, 
                              height: '60px' 
                            }}
                          />
                        )}
                        {dayIndex % 3 === 0 && (
                          <Skeleton 
                            className="absolute left-1 right-1 rounded"
                            style={{ 
                              top: `${180 + dayIndex * 15}px`, 
                              height: '40px' 
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