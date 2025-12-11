import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface InventoryCardSkeletonProps {
  count?: number;
}

export const InventoryCardSkeleton = ({ count = 8 }: InventoryCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-1.5">
            <div className="flex flex-col space-y-2">
              {/* Image skeleton */}
              <Skeleton className="aspect-square w-full" variant="rectangular" />
              
              {/* Title */}
              <Skeleton className="h-3 w-3/4" variant="text" />
              
              {/* Details */}
              <Skeleton className="h-2.5 w-1/2" variant="text" />
              
              {/* Price */}
              <div className="flex items-center justify-between pt-0.5">
                <Skeleton className="h-3 w-16" variant="text" />
                <Skeleton className="h-3.5 w-10 rounded-full" variant="rectangular" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
