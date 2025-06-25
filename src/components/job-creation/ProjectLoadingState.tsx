
import { Skeleton } from "@/components/ui/skeleton";

export const ProjectLoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      
      {/* Navigation skeleton */}
      <div className="flex space-x-0 px-6 bg-white border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 mx-1" />
        ))}
      </div>
      
      {/* Content area */}
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Creating new project...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    </div>
  );
};
