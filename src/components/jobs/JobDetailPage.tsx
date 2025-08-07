
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FolderOpen, Home, Package, FileText, Wrench, Mail, Calendar, User, MapPin, DollarSign, Clock } from "lucide-react";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectDetailsTab } from "./tabs/ProjectDetailsTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { QuotationTab } from "./tabs/QuotationTab";
import { WorkroomTab } from "./tabs/WorkroomTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { CalendarTab } from "./tabs/CalendarTab";
import { JobStatusDropdown } from "./JobStatusDropdown";

interface JobDetailPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobDetailPage = ({ jobId, onBack }: JobDetailPageProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();

  const project = projects?.find(p => p.id === jobId);
  const client = project?.client_id ? clients?.find(c => c.id === project.client_id) : null;

  if (!project) {
    return (
      <div className="min-h-screen bg-background w-full flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-muted-foreground">Job not found</div>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateProject = async (projectData: any) => {
    await updateProject.mutateAsync(projectData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "in-production": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "approved": return "bg-primary/10 text-primary border-primary/20";
      case "quoted": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "measuring": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const tabs = [
    { id: "details", label: "Project Details", icon: Home },
    { id: "rooms", label: "Rooms & Treatments", icon: Package },
    { id: "quotation", label: "Quotation", icon: FileText },
    { id: "workroom", label: "Workroom", icon: Wrench },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Compact Header Bar */}
      <div className="bg-card border-b shadow-sm">
        <div className="px-4 py-3">
          {/* Navigation & Main Info in Single Row */}
          <div className="flex items-center justify-between">
            {/* Left: Navigation + Job Info */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-1 hover:bg-muted text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-foreground">
                  {project.name}
                </h1>
                <JobStatusDropdown
                  currentStatus={project.status}
                  jobType="project"
                  jobId={project.id}
                  onStatusChange={(newStatus) => {
                    // The status will be updated via the mutation, just for UI feedback
                  }}
                />
                <span className="font-mono bg-muted px-2 py-1 rounded text-xs text-muted-foreground">
                  {project.job_number}
                </span>
              </div>
            </div>

            {/* Right: Client & Key Info */}
            <div className="flex items-center space-x-6 text-sm">
              {/* Client Info */}
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {client ? client.name : 'No client'}
                </span>
                {client?.email && (
                  <span className="text-muted-foreground">• {client.email}</span>
                )}
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              {/* Key Metrics */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due:</span>
                  <span className="text-foreground font-medium">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="bg-card border-b">
            <div className="px-4">
              <TabsList className="bg-transparent p-0 h-auto border-b-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 rounded-none flex items-center gap-2 hover:bg-muted/50"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-background min-h-[calc(100vh-160px)]">
            <div className="p-4">
              <TabsContent value="details" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <RoomsTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <QuotationTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workroom" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <WorkroomTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <EmailsTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border">
                  <div className="p-6">
                    <CalendarTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
