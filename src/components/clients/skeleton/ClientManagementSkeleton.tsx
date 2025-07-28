import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ClientManagementSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton variant="text" className="h-8 w-40" />
          <Skeleton variant="text" className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Search skeleton */}
      <Skeleton className="h-10 w-full sm:w-80 rounded-md" />
      
      {/* Client cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton variant="circular" className="h-12 w-12" />
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-5 w-24" />
                    <Skeleton variant="text" className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton variant="circular" className="h-8 w-8" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-4 w-4" />
                  <Skeleton variant="text" className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-4 w-4" />
                  <Skeleton variant="text" className="h-4 w-36" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-4 w-4" />
                  <Skeleton variant="text" className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};