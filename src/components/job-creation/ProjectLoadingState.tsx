
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/ui/loading-state";

export const ProjectLoadingState = () => {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header skeleton */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <Skeleton variant="text" className="h-8 w-16" />
          <Skeleton variant="text" className="h-8 w-48" />
        </div>
      </div>
      
      {/* Navigation skeleton */}
      <div className="flex space-x-0 px-6 bg-card border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton 
            key={i} 
            className="h-10 w-24 mx-1 rounded-md" 
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      
      {/* Content area */}
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-6 animate-scale-in">
          <LoadingState 
            size="lg" 
            text="Creating new project..." 
            variant="spinner"
          />
          <div className="space-y-2">
            <p className="text-muted-foreground">Setting up your workspace</p>
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
      </div>
    </div>
  );
};
