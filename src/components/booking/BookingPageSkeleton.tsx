import { Skeleton } from "@/components/ui/skeleton";

export const BookingPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-background rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid lg:grid-cols-[2fr_3fr]">
          {/* Left Panel - Branding Skeleton */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-10 min-h-[300px] lg:min-h-[600px]">
            <div className="space-y-6">
              {/* Logo and company name */}
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-xl bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/15" />
                </div>
              </div>

              {/* Scheduler info */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-4 w-full bg-white/15" />
                <Skeleton className="h-4 w-3/4 bg-white/15" />
              </div>

              {/* Details */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-white/15" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg bg-white/15" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust signal */}
            <div className="mt-auto pt-8">
              <Skeleton className="h-4 w-48 bg-white/10" />
            </div>
          </div>

          {/* Right Panel - Form Skeleton */}
          <div className="p-6 lg:p-8 space-y-6">
            {/* Calendar section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              
              {/* Calendar header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={`header-${i}`} className="h-4 w-full" />
                ))}
                {/* Day cells */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={`day-${i}`} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Time slots */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`time-${i}`} className="h-10 w-20 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4 pt-4 border-t">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            {/* Submit button */}
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
