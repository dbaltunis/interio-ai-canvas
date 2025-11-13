import { Skeleton } from "@/components/ui/skeleton";

export const AppLoadingSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Skeleton - Desktop */}
      <div className="hidden lg:block border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand section */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Navigation items */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
          
          {/* User section */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Header Skeleton - Mobile */}
      <div className="lg:hidden border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </main>

      {/* Bottom nav skeleton - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="grid grid-cols-5 h-16">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
