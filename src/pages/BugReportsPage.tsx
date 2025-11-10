import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface BugReport {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  route?: string;
}

const statusConfig = {
  open: { icon: AlertCircle, label: "Open", variant: "destructive" as const },
  in_progress: { icon: Clock, label: "In Progress", variant: "default" as const },
  resolved: { icon: CheckCircle2, label: "Resolved", variant: "default" as const },
  closed: { icon: XCircle, label: "Closed", variant: "secondary" as const },
};

const priorityConfig = {
  low: { label: "Low", variant: "secondary" as const },
  medium: { label: "Medium", variant: "default" as const },
  high: { label: "High", variant: "destructive" as const },
  critical: { label: "destructive" as const, variant: "destructive" as const },
};

export default function BugReportsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bugs, isLoading } = useQuery({
    queryKey: ["my-bug-reports"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bug_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BugReport[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bugId: string) => {
      const { error } = await supabase
        .from("bug_reports")
        .delete()
        .eq("id", bugId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bug-reports"] });
      toast({
        title: "Bug report deleted",
        description: "The bug report has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bug report. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bug Reports</h1>
        <p className="text-muted-foreground">
          Track all the bugs you've reported and their resolution status
        </p>
      </div>

      {!bugs || bugs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bug Reports Yet</h3>
            <p className="text-muted-foreground text-center">
              You haven't reported any bugs yet. Click the bug button in the bottom right to report an issue.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bugs.map((bug) => {
            const StatusIcon = statusConfig[bug.status as keyof typeof statusConfig]?.icon || AlertCircle;
            const statusInfo = statusConfig[bug.status as keyof typeof statusConfig] || statusConfig.open;
            const priorityInfo = priorityConfig[bug.priority as keyof typeof priorityConfig] || priorityConfig.medium;

            return (
              <Card key={bug.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{bug.title}</CardTitle>
                      </div>
                      <CardDescription>
                        Reported on {new Date(bug.created_at).toLocaleDateString()} at{" "}
                        {new Date(bug.created_at).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge variant={priorityInfo.variant}>
                        {priorityInfo.label}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Bug Report?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your bug report.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(bug.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{bug.description}</p>
                  </div>

                  {bug.steps_to_reproduce && (
                    <div>
                      <h4 className="font-semibold mb-2">Steps to Reproduce</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {bug.steps_to_reproduce}
                      </p>
                    </div>
                  )}

                  {(bug.expected_behavior || bug.actual_behavior) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {bug.expected_behavior && (
                        <div>
                          <h4 className="font-semibold mb-2">Expected Behavior</h4>
                          <p className="text-sm text-muted-foreground">{bug.expected_behavior}</p>
                        </div>
                      )}
                      {bug.actual_behavior && (
                        <div>
                          <h4 className="font-semibold mb-2">Actual Behavior</h4>
                          <p className="text-sm text-muted-foreground">{bug.actual_behavior}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {bug.route && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Route:</span> {bug.route}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
