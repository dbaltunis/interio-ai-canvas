import { Skeleton } from "@/components/ui/skeleton";
import { JobsTableSkeleton } from "./JobsTableSkeleton";

export const JobsPageSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton variant="text" className="h-8 w-32" />
          <Skeleton variant="text" className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      {/* Search and filters skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-80 rounded-md" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton variant="circular" className="h-10 w-10" />
          <Skeleton variant="circular" className="h-10 w-10" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div className="animate-scale-in" style={{ animationDelay: '200ms' }}>
        <JobsTableSkeleton />
      </div>
    </div>
  );
};