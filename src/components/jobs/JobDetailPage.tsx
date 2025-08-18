
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
      {/* Mobile-Optimized Header */}
      <div className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="px-3 py-3 space-y-3">
          {/* Top Row: Navigation + Title */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-muted text-muted-foreground shrink-0 h-9 px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {project.name}
              </h1>
            </div>
          </div>

          {/* Mobile Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm lg:hidden">
            {/* Job Number */}
            <div className="flex flex-col p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground mb-1">Job #</span>
              <span className="font-mono text-xs font-medium">
                {project.job_number || 'Unassigned'}
              </span>
            </div>

            {/* Status */}
            <div className="flex flex-col p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground mb-1">Status</span>
              <JobStatusDropdown
                currentStatus={project.status}
                jobType="project"
                jobId={project.id}
                onStatusChange={(newStatus) => {
                  // The status will be updated via the mutation
                }}
              />
            </div>
            
            {/* Client */}
            <div className="flex flex-col p-2 bg-muted/50 rounded-md col-span-2">
              <span className="text-xs text-muted-foreground mb-1">Client</span>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {client ? client.name : 'No client assigned'}
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex flex-col p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground mb-1">Due Date</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
            
            {/* Created */}
            <div className="flex flex-col p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground mb-1">Created</span>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:items-center justify-between">
            {/* Desktop info layout remains the same but with better spacing */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Job #</span>
                <span className="font-mono text-sm font-medium">
                  {project.job_number || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <JobStatusDropdown
                  currentStatus={project.status}
                  jobType="project"
                  jobId={project.id}
                  onStatusChange={(newStatus) => {
                    // The status will be updated via the mutation
                  }}
                />
              </div>
              
              <div className="flex items-center space-x-2 min-w-0">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium">
                  {client ? client.name : 'No client'}
                </span>
                {client?.email && (
                  <span className="text-muted-foreground">• {client.email}</span>
                )}
              </div>
              
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
          {/* Mobile-Optimized Tab Navigation */}
          <div className="bg-card border-b sticky top-[140px] lg:top-[120px] z-[9]">
            <div className="px-3 py-2">
              <TabsList className="bg-transparent p-0 h-auto border-b-0 w-full">
                {/* Mobile: Scrollable horizontal tabs */}
                <div className="flex lg:hidden overflow-x-auto pb-2 -mb-2 space-x-1 w-full">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger 
                        key={tab.id}
                        value={tab.id} 
                        className="px-4 py-3 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 rounded-t-lg flex items-center gap-2 hover:bg-muted/50 whitespace-nowrap min-w-fit"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label.split(' ')[0]}</span>
                      </TabsTrigger>
                    );
                  })}
                </div>

                {/* Desktop: Full width tabs */}
                <div className="hidden lg:flex w-full">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger 
                        key={tab.id}
                        value={tab.id} 
                        className="px-6 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 rounded-none flex items-center gap-2 hover:bg-muted/50 flex-1 justify-center"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </div>
              </TabsList>
            </div>
          </div>

          {/* Mobile-Optimized Tab Content */}
          <div className="bg-background p-3 lg:p-6 space-y-4">
            <TabsContent value="details" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <RoomsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <QuotationTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="workroom" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <WorkroomTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <EmailsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="bg-card rounded-lg shadow-sm border p-4 lg:p-6">
                  <CalendarTab projectId={jobId} />
                </div>
              </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
    );
  };
