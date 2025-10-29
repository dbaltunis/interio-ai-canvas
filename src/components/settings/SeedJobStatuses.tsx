import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useJobStatuses, useCreateJobStatus } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_STATUSES = [
  { name: "Lead", color: "gray", category: "Project", action: "editable", description: "Initial contact", sort_order: 1, slot_number: 1 },
  { name: "Quote Draft", color: "gray", category: "Project", action: "editable", description: "Preparing quote", sort_order: 2, slot_number: 2 },
  { name: "Quote Sent", color: "blue", category: "Project", action: "view_only", description: "Quote sent to client", sort_order: 3, slot_number: 3 },
  { name: "Approved", color: "green", category: "Project", action: "locked", description: "Quote approved, ready to start", sort_order: 4, slot_number: 4 },
  { name: "Planning", color: "gray", category: "Project", action: "editable", description: "Project planning phase", sort_order: 5, slot_number: 5 },
  { name: "In Progress", color: "blue", category: "Project", action: "progress_only", description: "Active work", sort_order: 6, slot_number: 6 },
  { name: "Materials Ordered", color: "orange", category: "Project", action: "progress_only", description: "Materials ordered", sort_order: 7, slot_number: 7 },
  { name: "Manufacturing", color: "yellow", category: "Project", action: "progress_only", description: "In manufacturing", sort_order: 8, slot_number: 8 },
  { name: "Quality Check", color: "primary", category: "Project", action: "view_only", description: "Quality inspection", sort_order: 9, slot_number: 9 },
  { name: "Completed", color: "green", category: "Project", action: "completed", description: "Project completed", sort_order: 10, slot_number: 10 },
];

export const SeedJobStatuses = () => {
  const { data: existingStatuses = [], isLoading } = useJobStatuses();
  const createStatus = useCreateJobStatus();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Only show if there are fewer than 10 active statuses
  const activeStatuses = existingStatuses.filter(s => s.is_active);
  const shouldShowSeed = activeStatuses.length < 10;

  console.log('[SeedJobStatuses] Debug:', {
    isLoading,
    totalStatuses: existingStatuses.length,
    activeStatuses: activeStatuses.length,
    shouldShowSeed,
    seeded
  });

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, HARD DELETE any existing statuses with slot_numbers 1-10 to free up the slots
      const { error: deleteError } = await supabase
        .from("job_statuses")
        .delete()
        .eq("user_id", user.id)
        .gte("slot_number", 1)
        .lte("slot_number", 10);
      
      if (deleteError) {
        console.error("Error deleting old statuses:", deleteError);
        throw deleteError;
      }
      
      // Now create the new statuses one by one
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
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Add Default Statuses ({activeStatuses.length}/10 slots filled)
          </CardTitle>
        </div>
        <CardDescription className="text-blue-800 dark:text-blue-300">
          You have {activeStatuses.length} active status{activeStatuses.length !== 1 ? 'es' : ''}. 
          Click below to add {10 - activeStatuses.length} comprehensive default project status{10 - activeStatuses.length !== 1 ? 'es' : ''}.
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
              Add {DEFAULT_STATUSES.length} Default Statuses
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Includes: Lead, Quote Draft, Quote Sent, Approved, Planning, In Progress, Materials Ordered, Manufacturing, Quality Check, Completed
        </p>
      </CardContent>
    </Card>
  );
};
