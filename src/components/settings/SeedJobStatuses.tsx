import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useJobStatuses, useCreateJobStatus } from "@/hooks/useJobStatuses";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_STATUSES = [
  // Quote Statuses (4 statuses)
  { name: "Draft", color: "gray", category: "Quote", action: "editable", description: "Initial quote creation, fully editable", sort_order: 1 },
  { name: "Quote Sent", color: "blue", category: "Quote", action: "view_only", description: "Quote has been sent to client", sort_order: 2 },
  { name: "Approved", color: "green", category: "Quote", action: "locked", description: "Quote approved by client", sort_order: 3 },
  { name: "Rejected", color: "red", category: "Quote", action: "locked", description: "Quote rejected by client", sort_order: 4 },
  
  // Project Statuses (6 statuses)
  { name: "Planning", color: "blue", category: "Project", action: "editable", description: "Project in planning phase, editable", sort_order: 5 },
  { name: "Order Confirmed", color: "orange", category: "Project", action: "progress_only", description: "Client confirmed order, locked for production", sort_order: 6 },
  { name: "In Production", color: "purple", category: "Project", action: "progress_only", description: "Project in production phase", sort_order: 7 },
  { name: "Review", color: "yellow", category: "Project", action: "view_only", description: "Project under review before completion", sort_order: 8 },
  { name: "Completed", color: "green", category: "Project", action: "completed", description: "Project completed successfully", sort_order: 9 },
  { name: "Cancelled", color: "red", category: "Project", action: "locked", description: "Project cancelled", sort_order: 10 },
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
          Click below to add {10 - activeStatuses.length} comprehensive default status{10 - activeStatuses.length !== 1 ? 'es' : ''} 
          ({4 - existingStatuses.filter(s => s.category === 'Quote' && s.is_active).length} Quote + {6 - existingStatuses.filter(s => s.category === 'Project' && s.is_active).length} Project).
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
          Includes: Draft, Quote Sent, Approved, Rejected (Quotes) + Planning, Order Confirmed, In Production, Review, Completed, Cancelled (Projects)
        </p>
      </CardContent>
    </Card>
  );
};
