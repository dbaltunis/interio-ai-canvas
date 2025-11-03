import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-muted',
      className
    )}
  />
);

export const OptionCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  </div>
);

export const HeadingSelectorSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-32" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <Skeleton className="aspect-square w-full rounded" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const FabricSelectorSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CostCalculationSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-6 w-48" />
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    <div className="pt-3 border-t">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  </div>
);
