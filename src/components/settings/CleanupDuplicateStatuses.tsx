import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import { useJobStatuses, useDeleteJobStatus } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";

export const CleanupDuplicateStatuses = () => {
  const { data: existingStatuses = [], isLoading } = useJobStatuses();
  const deleteStatus = useDeleteJobStatus();
  const { toast } = useToast();
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Find old statuses with slot_numbers 1-5 that need to be removed before seeding
  const oldStatuses = existingStatuses.filter(s => 
    s.is_active && s.slot_number !== null && s.slot_number >= 1 && s.slot_number <= 10
  );

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      for (const status of oldStatuses) {
        await deleteStatus.mutateAsync(status.id);
      }
      toast({
        title: "Success!",
        description: `Removed ${oldStatuses.length} duplicate statuses.`,
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error cleaning up statuses:", error);
      toast({
        title: "Error",
        description: "Failed to remove duplicate statuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  if (isLoading || oldStatuses.length === 0) return null;

  return (
    <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <CardTitle className="text-red-900 dark:text-red-100">
            Duplicate Statuses Detected
          </CardTitle>
        </div>
        <CardDescription className="text-red-800 dark:text-red-300">
          You have {oldStatuses.length} old duplicate statuses. Click below to remove them and keep only the new comprehensive set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Will remove:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {oldStatuses.map(s => (
              <li key={s.id}>{s.name} ({s.category})</li>
            ))}
          </ul>
        </div>
        <Button 
          onClick={handleCleanup} 
          disabled={isCleaningUp}
          variant="destructive"
          className="w-full"
        >
          {isCleaningUp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Removing Duplicates...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove {oldStatuses.length} Duplicate Statuses
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
