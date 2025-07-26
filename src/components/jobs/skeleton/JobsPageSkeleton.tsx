import { Skeleton } from "@/components/ui/skeleton";
import { JobsTableSkeleton } from "./JobsTableSkeleton";

export const JobsPageSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Search and filters skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-80" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      {/* Table skeleton */}
      <JobsTableSkeleton />
    </div>
  );
};