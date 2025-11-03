import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Bug, Calendar, User, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "investigating" | "in_progress" | "resolved" | "closed";
  route: string | null;
  user_agent: string | null;
  browser_info: any;
  app_version: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

const statusConfig = {
  new: { icon: AlertCircle, color: "destructive", label: "New" },
  investigating: { icon: Clock, color: "warning", label: "Investigating" },
  in_progress: { icon: Clock, color: "default", label: "In Progress" },
  resolved: { icon: CheckCircle2, color: "success", label: "Resolved" },
  closed: { icon: XCircle, color: "secondary", label: "Closed" },
};

const priorityConfig = {
  low: { color: "secondary", label: "Low" },
  medium: { color: "default", label: "Medium" },
  high: { color: "warning", label: "High" },
  critical: { color: "destructive", label: "Critical" },
};

export default function AdminBugManagement() {
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: bugs, isLoading } = useQuery({
    queryKey: ["bug_reports", statusFilter, priorityFilter],
    queryFn: async () => {
      let query = supabase
        .from("bug_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter);
      }

      const { data: bugsData, error } = await query;

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(bugsData?.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return bugsData?.map(bug => ({
        ...bug,
        profiles: profileMap.get(bug.user_id) || { email: "Unknown", full_name: null }
      })) as BugReport[];
    },
  });

  const updateBugStatus = useMutation({
    mutationFn: async ({ bugId, status }: { bugId: string; status: string }) => {
      const { error } = await supabase
        .from("bug_reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", bugId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug_reports"] });
      toast({
        title: "Status updated",
        description: "Bug report status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bug status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating bug status:", error);
    },
  });

  const filteredBugs = bugs?.filter((bug) =>
    searchQuery === "" ||
    bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bug.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusIcon = selectedBug ? statusConfig[selectedBug.status].icon : AlertCircle;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bug Management</h1>
        <p className="text-muted-foreground">Review and manage bug reports from users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bugs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {bugs?.filter((b) => b.status === "new").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bugs?.filter((b) => b.status === "in_progress" || b.status === "investigating").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {bugs?.filter((b) => b.status === "resolved" || b.status === "closed").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bug Reports</CardTitle>
          <CardDescription>Click on a report to view details and update status</CardDescription>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Input
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading bug reports...</div>
          ) : filteredBugs && filteredBugs.length > 0 ? (
            <div className="space-y-4">
              {filteredBugs.map((bug) => {
                const StatusIcon = statusConfig[bug.status].icon;
                return (
                  <Card
                    key={bug.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedBug(bug)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{bug.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{bug.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={statusConfig[bug.status].color as any}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[bug.status].label}
                            </Badge>
                            <Badge variant={priorityConfig[bug.priority].color as any}>
                              {priorityConfig[bug.priority].label}
                            </Badge>
                            {bug.app_version && (
                              <Badge variant="outline">{bug.app_version}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{bug.profiles?.email || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(bug.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No bugs found matching your search." : "No bug reports yet."}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedBug} onOpenChange={() => setSelectedBug(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              {selectedBug?.title}
            </DialogTitle>
            <DialogDescription>
              Reported by {selectedBug?.profiles?.email} on{" "}
              {selectedBug && format(new Date(selectedBug.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="flex gap-2">
                <Badge variant={selectedBug ? (statusConfig[selectedBug.status].color as any) : "default"}>
                  {selectedBug && <StatusIcon className="h-3 w-3 mr-1" />}
                  {selectedBug && statusConfig[selectedBug.status].label}
                </Badge>
                <Badge variant={selectedBug ? (priorityConfig[selectedBug.priority].color as any) : "default"}>
                  {selectedBug && priorityConfig[selectedBug.priority].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select
                  value={selectedBug?.status}
                  onValueChange={(value) => {
                    if (selectedBug) {
                      updateBugStatus.mutate({ bugId: selectedBug.id, status: value });
                      setSelectedBug({ ...selectedBug, status: value as any });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedBug?.description}</p>
              </div>

              {selectedBug?.steps_to_reproduce && (
                <div className="space-y-2">
                  <Label>Steps to Reproduce</Label>
                  <pre className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {selectedBug.steps_to_reproduce}
                  </pre>
                </div>
              )}

              {selectedBug?.expected_behavior && (
                <div className="space-y-2">
                  <Label>Expected Behavior</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedBug.expected_behavior}</p>
                </div>
              )}

              {selectedBug?.actual_behavior && (
                <div className="space-y-2">
                  <Label>Actual Behavior</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedBug.actual_behavior}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Technical Details</Label>
                <div className="space-y-1 text-sm bg-muted p-3 rounded-md">
                  {selectedBug?.route && <p><strong>Route:</strong> {selectedBug.route}</p>}
                  {selectedBug?.app_version && <p><strong>Version:</strong> {selectedBug.app_version}</p>}
                  {selectedBug?.browser_info && (
                    <>
                      <p><strong>Browser:</strong> {selectedBug.browser_info.userAgent}</p>
                      <p><strong>Platform:</strong> {selectedBug.browser_info.platform}</p>
                      <p><strong>Screen:</strong> {selectedBug.browser_info.screenResolution?.width} x {selectedBug.browser_info.screenResolution?.height}</p>
                      <p><strong>Viewport:</strong> {selectedBug.browser_info.viewport?.width} x {selectedBug.browser_info.viewport?.height}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
