import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const MeasurementWorksheetSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="window-type" className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2">
              <TabsTrigger value="window-type" disabled>
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
              <TabsTrigger value="treatment" disabled>
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
              <TabsTrigger value="measurements" disabled>
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
              <TabsTrigger value="pricing" disabled>
                <Skeleton className="h-4 w-20" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="window-type" className="space-y-4 mt-4">
              {/* Window Type Selector Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-24 w-full rounded" />
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Side Panel Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
