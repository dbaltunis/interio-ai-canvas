import { useState, useMemo } from "react";
import { formatJobNumber } from "@/lib/format-job-number";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Package, FileText, Wrench, Mail, Calendar, Clock } from "lucide-react";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectDetailsTab } from "./tabs/ProjectDetailsTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { QuotationTab } from "./tabs/QuotationTab";
import { ProjectMaterialsTab } from "./ProjectMaterialsTab";
import { WorkroomTab } from "./tabs/WorkroomTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { CalendarTab } from "./tabs/CalendarTab";
import { JobStatusDropdown } from "./JobStatusDropdown";
import { JobSkeleton } from "./JobSkeleton";
import { JobNotFound } from "./JobNotFound";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { useTreatmentMaterialsStatus } from "@/hooks/useProjectMaterialsStatus";

interface JobDetailPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobDetailPage = ({ jobId, onBack }: JobDetailPageProps) => {
  const [activeTab, setActiveTab] = useState("details");
  
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const updateProject = useUpdateProject();
  
  // Fetch materials data for badge indicators
  const { data: treatmentMaterials = [] } = useProjectMaterialsUsage(jobId);
  const { data: materialStatusMap = {} } = useTreatmentMaterialsStatus(jobId);

  // Use defensive loading and state management
  const project = projects?.find(p => p.id === jobId);
  const client = project?.client_id ? clients?.find(c => c.id === project.client_id) : null;
  
  // Calculate unprocessed materials count
  const unprocessedMaterialsCount = useMemo(() => {
    return treatmentMaterials.filter(material => {
      const materialId = `${material.itemId}-${material.surfaceId}`;
      const status = materialStatusMap[materialId];
      return !status || status === 'not_processed';
    }).length;
  }, [treatmentMaterials, materialStatusMap]);
  
  // Show loading skeleton while data is being fetched
  if (!projects || projects.length === 0) {
    return <JobSkeleton />;
  }

  // Only show 404 if we've confirmed the project doesn't exist after loading
  if (!project) {
    return <JobNotFound onBack={onBack} />;
  }

  const handleUpdateProject = async (projectData: any) => {
    await updateProject.mutateAsync(projectData);
  };

  const tabs = [
    { id: "details", label: "Client", icon: User },
    { id: "rooms", label: "Rooms & Treatments", icon: Package },
    { id: "quotation", label: "Quotation", icon: FileText },
    { id: "materials", label: "Materials", icon: Package },
    { id: "workroom", label: "Workroom", icon: Wrench },
    { id: "emails", label: "Emails", icon: Mail },
    { id: "calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <div className="h-screen bg-background w-full flex flex-col overflow-hidden">
      {/* Enhanced Header Section - Scrolls away */}
      <div className="bg-gradient-to-r from-card/95 to-card border-b border-border/50 shadow-sm backdrop-blur-sm">
        <div className="px-3 sm:px-6 py-4">
          {/* Single Row Layout */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left Side: Navigation + Job Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2 hover:bg-muted/80 text-muted-foreground 
                  shrink-0 px-3 py-2 rounded-lg transition-all duration-200
                  hover:text-foreground hover:shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden lg:inline font-medium">Back</span>
              </Button>
              
              <Separator orientation="vertical" className="h-6 bg-border/60 hidden sm:block" />
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-foreground truncate leading-tight">
                  {project.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-muted/50">
                    #{formatJobNumber(project.job_number)}
                  </Badge>
                  {client && (
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                      {client.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Status */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
              <JobStatusDropdown
                currentStatusId={project.status_id}
                currentStatus={project.status}
                jobType="project"
                jobId={project.id}
                onStatusChange={(newStatus) => {
                  // Status updated via mutation
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Tabs and Content - Tabs stay sticky */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Standardized Tab Navigation - STICKY */}
          <div className="sticky top-0 z-20 bg-background border-b border-border/50 shadow-sm">
            <div className="px-2 sm:px-4">
              <div className="flex w-full justify-start gap-0 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 transition-all duration-200 text-xs sm:text-sm font-medium border-b-2 rounded-none whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? "border-primary text-foreground bg-primary/5 font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      {tab.id === "materials" && unprocessedMaterialsCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1 h-5 min-w-5 px-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-semibold"
                        >
                          {unprocessedMaterialsCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-background pb-24">
            <div className="p-2 sm:p-4">
              <TabsContent value="details" className="mt-0">
                <div className="modern-card p-3 sm:p-6">
                  <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-0">
                <div className="modern-card p-6">
                  <RoomsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="mt-0">
                <div className="modern-card p-2 sm:p-4 lg:p-6">
                  <QuotationTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="materials" className="mt-0">
                <div className="modern-card p-6">
                  <ProjectMaterialsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="workroom" className="mt-0">
                <div className="modern-card p-6">
                  <WorkroomTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <div className="modern-card p-6">
                  <EmailsTab projectId={jobId} />
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="modern-card p-6">
                  <CalendarTab projectId={jobId} />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
