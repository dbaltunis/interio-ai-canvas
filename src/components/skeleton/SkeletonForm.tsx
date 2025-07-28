import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonFormProps {
  fields?: number;
  showSubmit?: boolean;
  className?: string;
}

export const SkeletonForm = ({ fields = 4, showSubmit = true, className }: SkeletonFormProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      {showSubmit && (
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      )}
    </div>
  );
};