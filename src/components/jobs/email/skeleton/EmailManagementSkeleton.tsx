import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EmailManagementSkeleton = () => {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full px-6 py-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
          
          {/* Navigation Tabs skeleton */}
          <Tabs value="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="composer" className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {/* Integration banners skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          
          {/* Dashboard content skeleton */}
          <div className="liquid-glass rounded-xl border p-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
            
            {/* Email list skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
              
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};