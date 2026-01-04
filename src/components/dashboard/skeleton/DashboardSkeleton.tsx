import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header skeleton - Compact */}
      <div className="space-y-1">
        <Skeleton variant="text" className="h-6 w-40" />
        <Skeleton variant="text" className="h-4 w-56" />
      </div>
      
      {/* Stats cards skeleton - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} variant="analytics" className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="circular" className="h-6 w-6" />
                </div>
                <Skeleton variant="text" className="h-6 w-12" />
                <div className="flex items-center gap-1.5">
                  <Skeleton variant="circular" className="h-1.5 w-1.5" />
                  <Skeleton variant="text" className="h-2.5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Widget grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} variant="analytics" className="animate-scale-in" style={{ animationDelay: `${(index + 4) * 50}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" className="h-4 w-28" />
                <Skeleton variant="text" className="h-4 w-12" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border/30">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1 space-y-1">
                      <Skeleton variant="text" className="h-3 w-3/4" />
                      <Skeleton variant="text" className="h-2.5 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
