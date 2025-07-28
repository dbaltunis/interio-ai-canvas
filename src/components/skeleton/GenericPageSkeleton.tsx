import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const GenericPageSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-5 w-64" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-6">
        <Card className="animate-scale-in">
          <CardHeader>
            <Skeleton variant="text" className="h-6 w-32" />
            <Skeleton variant="text" className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton variant="rectangular" className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-6">
              <Skeleton variant="rectangular" className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card className="animate-scale-in" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-6">
              <Skeleton variant="rectangular" className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};