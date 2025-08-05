import { Skeleton } from "@/components/ui/skeleton";

interface LoadingFallbackProps {
  title?: string;
  rows?: number;
}

export const LoadingFallback = ({ title = "Loading...", rows = 3 }: LoadingFallbackProps) => {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};