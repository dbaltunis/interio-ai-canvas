import { Card, CardContent } from "@/components/ui/card";

export const JobSkeleton = () => {
  return (
    <div className="min-h-screen bg-background w-full flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-muted-foreground">Loading job details...</div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  );
};