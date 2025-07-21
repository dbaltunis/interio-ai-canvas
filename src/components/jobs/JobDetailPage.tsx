
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FolderOpen, Home, Package, FileText, Wrench, Mail, Calendar } from "lucide-react";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ProjectDetailsTab } from "./tabs/ProjectDetailsTab";
import { RoomsTab } from "./tabs/RoomsTab";
import { QuotationTab } from "./tabs/QuotationTab";
import { WorkroomTab } from "./tabs/WorkroomTab";
import { EmailsTab } from "./tabs/EmailsTab";
import { CalendarTab } from "./tabs/CalendarTab";

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
      <div className="min-h-screen bg-white w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-gray-500">Job not found</div>
          <Button onClick={onBack} variant="outline">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateProject = async (projectData: any) => {
    await updateProject.mutateAsync(projectData);
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
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h1>
              <p className="text-sm text-gray-500">
                {project.job_number} • {client ? client.name : 'No client assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              Status: <span className="font-medium capitalize">{project.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Workspace Tabs */}
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-gray-50 px-6">
            <TabsList className="bg-transparent p-0 h-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="px-4 py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary rounded-none flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="details" className="mt-0">
              <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
            </TabsContent>

            <TabsContent value="rooms" className="mt-0">
              <RoomsTab projectId={jobId} />
            </TabsContent>

            <TabsContent value="quotation" className="mt-0">
              <QuotationTab projectId={jobId} />
            </TabsContent>

            <TabsContent value="workroom" className="mt-0">
              <WorkroomTab projectId={jobId} />
            </TabsContent>

            <TabsContent value="emails" className="mt-0">
              <EmailsTab projectId={jobId} />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <CalendarTab projectId={jobId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
