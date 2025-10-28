import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useJobStatuses, useCreateJobStatus } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_STATUSES = [
  // Quote Statuses
  { name: "Draft", color: "gray", category: "Quote", action: "editable", description: "Quote is being prepared", sort_order: 1 },
  { name: "Sent", color: "blue", category: "Quote", action: "view_only", description: "Quote sent to client", sort_order: 2 },
  { name: "Approved", color: "green", category: "Quote", action: "locked", description: "Quote approved by client", sort_order: 3 },
  { name: "Rejected", color: "red", category: "Quote", action: "locked", description: "Quote rejected", sort_order: 4 },
  
  // Project Statuses
  { name: "Planning", color: "gray", category: "Project", action: "editable", description: "Project is in planning phase", sort_order: 5 },
  { name: "In Progress", color: "blue", category: "Project", action: "progress_only", description: "Project work in progress", sort_order: 6 },
  { name: "On Hold", color: "yellow", category: "Project", action: "requires_reason", description: "Project temporarily paused", sort_order: 7 },
  { name: "Review", color: "orange", category: "Project", action: "view_only", description: "Project under review", sort_order: 8 },
  { name: "Completed", color: "green", category: "Project", action: "completed", description: "Project completed", sort_order: 9 },
  { name: "Installed", color: "primary", category: "Project", action: "completed", description: "Project installed", sort_order: 10 },
];

export const SeedJobStatuses = () => {
  const { data: existingStatuses = [], isLoading } = useJobStatuses();
  const createStatus = useCreateJobStatus();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Only show if there are fewer than 5 active statuses
  const activeStatuses = existingStatuses.filter(s => s.is_active);
  const shouldShowSeed = activeStatuses.length < 5;

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      for (const status of DEFAULT_STATUSES) {
        await createStatus.mutateAsync(status);
      }
      setSeeded(true);
      toast({
        title: "Success!",
        description: "Default job statuses have been created.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error seeding statuses:", error);
      toast({
        title: "Error",
        description: "Failed to create default statuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) return null;
  if (!shouldShowSeed || seeded) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-orange-900 dark:text-orange-100">Setup Required</CardTitle>
        </div>
        <CardDescription className="text-orange-800 dark:text-orange-300">
          No job statuses found. Create default statuses to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleSeed} 
          disabled={isSeeding}
          className="w-full"
        >
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Statuses...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Create Default Job Statuses
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          This will create {DEFAULT_STATUSES.length} default statuses (quotes & projects) that you can customize later.
        </p>
      </CardContent>
    </Card>
  );
};
