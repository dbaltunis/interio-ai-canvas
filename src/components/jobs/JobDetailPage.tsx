
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
          {/* Mobile-First Responsive Layout */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Top Row: Navigation + Job Info + Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-1 hover:bg-muted text-muted-foreground shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2">
                  <JobStatusDropdown
                    currentStatus={project.status}
                    jobType="project"
                    jobId={project.id}
                    onStatusChange={(newStatus) => {
                      // The status will be updated via the mutation
                    }}
                  />
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    #{project.job_number}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bottom Row: Client + Dates (responsive) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
              {/* Client Info */}
              <div className="flex items-center gap-2 min-w-0">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <span className="text-foreground font-medium truncate block">
                    {client ? client.name : 'No client'}
                  </span>
                  {client?.email && (
                    <span className="text-muted-foreground text-xs truncate block">
                      {client.email}
                    </span>
                  )}
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              
              {/* Key Dates */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground hidden sm:inline">Due:</span>
                  <span className="text-foreground font-medium">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 hidden md:flex">
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
          {/* Clean Tab Navigation */}
          <div className="bg-card border-b">
            <div className="px-4">
              <TabsList className="bg-transparent p-0 h-auto border-b-0 w-full justify-start">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="px-3 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 rounded-none flex items-center gap-2 hover:bg-muted/50 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.label.split(' ')[0]}
                      </span>
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
                <div className="bg-card rounded-lg shadow-sm border p-6">
                  <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
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
