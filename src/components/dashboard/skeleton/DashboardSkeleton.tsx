import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-5 w-64" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" className="h-4 w-20" />
                  <Skeleton variant="circular" className="h-8 w-8" />
                </div>
                <Skeleton variant="text" className="h-8 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-2 w-2" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-scale-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-32" />
            <Skeleton variant="text" className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton variant="rectangular" className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="animate-scale-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-32" />
            <Skeleton variant="text" className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton variant="rectangular" className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};