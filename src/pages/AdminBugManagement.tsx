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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Bug, Calendar, User, AlertCircle, CheckCircle2, Clock, XCircle, Users, Target, Upload, X } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, isBefore, isAfter, isWithinInterval } from "date-fns";
import { useTeamMembers } from "@/hooks/useTeamMembers";

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
  assigned_to: string | null;
  target_fix_date: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    email: string;
    display_name?: string;
  };
  assignee?: {
    email: string;
    display_name?: string;
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
  const [viewMode, setViewMode] = useState<"list" | "roadmap">("list");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { data: teamMembers } = useTeamMembers();

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

      // Fetch reporter and assignee profiles
      const reporterIds = [...new Set(bugsData?.map(b => b.user_id).filter(Boolean))] as string[];
      const assigneeIds = [...new Set(bugsData?.map(b => b.assigned_to).filter(Boolean))] as string[];
      const allUserIds = [...new Set([...reporterIds, ...assigneeIds])];

      if (allUserIds.length === 0) {
        return bugsData as BugReport[];
      }

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .in("user_id", allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, { display_name: p.display_name }]) || []);

      return bugsData?.map(bug => ({
        ...bug,
        reporter: {
          email: bug.user_id,
          display_name: profileMap.get(bug.user_id)?.display_name
        },
        assignee: bug.assigned_to ? {
          email: bug.assigned_to,
          display_name: profileMap.get(bug.assigned_to)?.display_name
        } : undefined
      })) as BugReport[];
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedBug) return;
    
    setUploading(true);
    const files = Array.from(event.target.files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedBug.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('bug-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('bug-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const currentImages = selectedBug.images || [];
      const newImages = [...currentImages, ...uploadedUrls];

      await updateBug.mutateAsync({
        bugId: selectedBug.id,
        updates: { images: newImages }
      });

      setSelectedBug({ ...selectedBug, images: newImages });

      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!selectedBug) return;

    try {
      const fileName = imageUrl.split('/bug-images/')[1];
      if (fileName) {
        await supabase.storage.from('bug-images').remove([fileName]);
      }

      const newImages = (selectedBug.images || []).filter(url => url !== imageUrl);
      
      await updateBug.mutateAsync({
        bugId: selectedBug.id,
        updates: { images: newImages }
      });

      setSelectedBug({ ...selectedBug, images: newImages });

      toast({
        title: "Image deleted",
        description: "Image removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    }
  };

  const updateBug = useMutation({
    mutationFn: async ({ bugId, updates }: { bugId: string; updates: Partial<BugReport> }) => {
      const { error } = await supabase
        .from("bug_reports")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", bugId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug_reports"] });
      toast({
        title: "Updated successfully",
        description: "Bug report has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bug. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating bug:", error);
    },
  });

  const filteredBugs = bugs?.filter((bug) =>
    searchQuery === "" ||
    bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bug.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusIcon = selectedBug ? statusConfig[selectedBug.status].icon : AlertCircle;

  // Group bugs by week for roadmap view
  const groupBugsByWeek = () => {
    if (!filteredBugs) return [];
    
    const today = new Date();
    const weeks: Array<{ label: string; start: Date; end: Date; bugs: BugReport[] }> = [];
    
    // Overdue
    weeks.push({
      label: "Overdue",
      start: new Date(0),
      end: today,
      bugs: filteredBugs.filter(b => b.target_fix_date && isBefore(parseISO(b.target_fix_date), today))
    });
    
    // Next 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      weeks.push({
        label: i === 0 ? "This Week" : `Week of ${format(weekStart, "MMM d")}`,
        start: weekStart,
        end: weekEnd,
        bugs: filteredBugs.filter(b => b.target_fix_date && isWithinInterval(parseISO(b.target_fix_date), { start: weekStart, end: weekEnd }))
      });
    }
    
    // Later
    const fourWeeksOut = endOfWeek(addWeeks(today, 3), { weekStartsOn: 1 });
    weeks.push({
      label: "Later",
      start: fourWeeksOut,
      end: new Date(9999, 11, 31),
      bugs: filteredBugs.filter(b => b.target_fix_date && isAfter(parseISO(b.target_fix_date), fourWeeksOut))
    });
    
    // No date set
    weeks.push({
      label: "No Target Date",
      start: new Date(0),
      end: new Date(9999, 11, 31),
      bugs: filteredBugs.filter(b => !b.target_fix_date)
    });
    
    return weeks.filter(w => w.bugs.length > 0);
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>Click on a report to view details and update status</CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
          ) : viewMode === "list" ? (
            filteredBugs && filteredBugs.length > 0 ? (
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
                        <div className="flex items-start justify-between gap-4">
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
                          <div className="text-right text-sm text-muted-foreground space-y-1 min-w-[200px]">
                            <div className="flex items-center gap-1 justify-end">
                              <User className="h-3 w-3" />
                              <span className="truncate">{bug.reporter?.display_name || bug.reporter?.email || "Unknown"}</span>
                            </div>
                            {bug.assignee && (
                              <div className="flex items-center gap-1 justify-end">
                                <Users className="h-3 w-3" />
                                <span className="truncate">{bug.assignee.display_name || bug.assignee.email}</span>
                              </div>
                            )}
                            {bug.target_fix_date && (
                              <div className="flex items-center gap-1 justify-end">
                                <Target className="h-3 w-3" />
                                <span>{format(parseISO(bug.target_fix_date), "MMM d, yyyy")}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 justify-end">
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
            )
          ) : (
            // Roadmap View
            <div className="space-y-6">
              {groupBugsByWeek().map((week) => (
                <div key={week.label} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{week.label}</h3>
                    <Badge variant="outline">{week.bugs.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {week.bugs.map((bug) => {
                      const StatusIcon = statusConfig[bug.status].icon;
                      return (
                        <Card
                          key={bug.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedBug(bug)}
                        >
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Bug className="h-4 w-4 text-muted-foreground" />
                                  <h4 className="font-medium">{bug.title}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge variant={statusConfig[bug.status].color as any} className="text-xs">
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig[bug.status].label}
                                  </Badge>
                                  <Badge variant={priorityConfig[bug.priority].color as any} className="text-xs">
                                    {priorityConfig[bug.priority].label}
                                  </Badge>
                                  {bug.assignee && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      <span>{bug.assignee.display_name || bug.assignee.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {bug.target_fix_date && (
                                <div className="text-xs text-muted-foreground">
                                  {format(parseISO(bug.target_fix_date), "MMM d")}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groupBugsByWeek().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No bugs scheduled on the roadmap yet.
                </div>
              )}
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
              Reported by {selectedBug?.reporter?.display_name || selectedBug?.reporter?.email} on{" "}
              {selectedBug && format(new Date(selectedBug.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select
                    value={selectedBug?.status}
                    onValueChange={(value: BugReport["status"]) => {
                      if (selectedBug) {
                        updateBug.mutate({ bugId: selectedBug.id, updates: { status: value } });
                        setSelectedBug({ ...selectedBug, status: value });
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
                  <Label>Assign To</Label>
                  <Select
                    value={selectedBug?.assigned_to || "unassigned"}
                    onValueChange={(value) => {
                      if (selectedBug) {
                        const assignedTo = value === "unassigned" ? null : value;
                        updateBug.mutate({ bugId: selectedBug.id, updates: { assigned_to: assignedTo } });
                        setSelectedBug({ ...selectedBug, assigned_to: assignedTo });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {teamMembers?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target Fix Date</Label>
                <Input
                  type="date"
                  value={selectedBug?.target_fix_date || ""}
                  onChange={(e) => {
                    if (selectedBug) {
                      updateBug.mutate({ bugId: selectedBug.id, updates: { target_fix_date: e.target.value || null } });
                      setSelectedBug({ ...selectedBug, target_fix_date: e.target.value || null });
                    }
                  }}
                />
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

              <div className="space-y-2">
                <Label>Screenshots & Images</Label>
                <div className="space-y-3">
                  {selectedBug?.images && selectedBug.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedBug.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Bug screenshot ${index + 1}`}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageDelete(url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && (
                      <p className="text-sm text-muted-foreground mt-2">Uploading images...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
