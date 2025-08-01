import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const InventorySkeleton = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-10 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Search and View Controls skeleton */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fabrics" className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            Fabrics
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="assemblies" className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            Assemblies
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <div className="space-y-6">
          {/* Stats cards skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Quick Actions skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-24" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent activity skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-32" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};