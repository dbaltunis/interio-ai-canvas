
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
      <div className="min-h-screen bg-gray-50 w-full flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-gray-500">Job not found</div>
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
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "in-production": return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved": return "bg-purple-100 text-purple-800 border-purple-200";
      case "quoted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "measuring": return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Navigation */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
          </div>

          {/* Job Header Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Job Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {project.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {project.job_number}
                    </span>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {client ? client.name : 'No client assigned'}
                      </p>
                      {client && (
                        <div className="text-sm text-gray-500 space-y-1">
                          {client.email && <p>{client.email}</p>}
                          {client.phone && <p>{client.phone}</p>}
                          {client.address && (
                            <p className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {client.address}
                              {client.city && `, ${client.city}`}
                              {client.state && `, ${client.state}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Project Value</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(project.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="bg-white border-b">
            <div className="px-6">
              <TabsList className="bg-transparent p-0 h-auto border-b-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="px-6 py-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:text-brand-primary data-[state=active]:bg-blue-50/50 rounded-none flex items-center gap-2 hover:bg-gray-50"
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
          <div className="bg-gray-50 min-h-[calc(100vh-280px)]">
            <div className="p-6">
              <TabsContent value="details" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <ProjectDetailsTab project={project} onUpdate={handleUpdateProject} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <RoomsTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <QuotationTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="workroom" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <WorkroomTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6">
                    <EmailsTab projectId={jobId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <div className="bg-white rounded-lg shadow-sm border">
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
