import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Wrench, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const FixJobStatuses = () => {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);

  const handleFix = async () => {
    setIsFixing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Step 1: Create missing Planning status for slot 5
      const { data: planningStatus, error: createError } = await supabase
        .from("job_statuses")
        .insert({
          user_id: user.id,
          name: "Planning",
          color: "blue",
          category: "Project",
          action: "editable",
          description: "Project in planning phase, editable",
          sort_order: 5,
          slot_number: 5,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      // Step 2: Get all active statuses
      const { data: activeStatuses } = await supabase
        .from("job_statuses")
        .select("id, name, category")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!activeStatuses) throw new Error("Failed to fetch active statuses");

      // Step 3: Update all projects using inactive statuses
      const { data: projects } = await supabase
        .from("projects")
        .select("id, status_id")
        .eq("user_id", user.id);

      if (projects) {
        for (const project of projects) {
          if (project.status_id) {
            const { data: oldStatus } = await supabase
              .from("job_statuses")
              .select("name, category")
              .eq("id", project.status_id)
              .maybeSingle();
            
            if (oldStatus) {
              const newStatus = activeStatuses.find(s => 
                s.name === oldStatus.name && s.category === oldStatus.category
              );
              if (newStatus) {
                await supabase
                  .from("projects")
                  .update({ status_id: newStatus.id })
                  .eq("id", project.id);
              }
            }
          }
        }
      }

      // Step 4: Update all quotes using inactive statuses
      const { data: quotes } = await supabase
        .from("quotes")
        .select("id, status_id")
        .eq("user_id", user.id);

      if (quotes) {
        for (const quote of quotes) {
          if (quote.status_id) {
            const { data: oldStatus } = await supabase
              .from("job_statuses")
              .select("name, category")
              .eq("id", quote.status_id)
              .maybeSingle();
            
            if (oldStatus) {
              const newStatus = activeStatuses.find(s => 
                s.name === oldStatus.name && s.category === oldStatus.category
              );
              if (newStatus) {
                await supabase
                  .from("quotes")
                  .update({ status_id: newStatus.id })
                  .eq("id", quote.id);
              }
            }
          }
        }
      }

      toast({
        title: "Success!",
        description: "All job statuses have been fixed.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error fixing statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fix statuses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-orange-900 dark:text-orange-100">
            Fix Status Issues
          </CardTitle>
        </div>
        <CardDescription className="text-orange-800 dark:text-orange-300">
          Create missing Planning status and update all jobs to use active statuses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleFix} 
          disabled={isFixing}
          variant="default"
          className="w-full"
        >
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing Statuses...
            </>
          ) : (
            <>
              <Wrench className="mr-2 h-4 w-4" />
              Fix All Status Issues
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
