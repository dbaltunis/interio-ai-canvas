
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, User, MapPin, Clock, FileText, Image, Settings } from "lucide-react";
import { FileUpload } from "@/components/files/FileUpload";
import { ProjectTimeline } from "./ProjectTimeline";
import { ProjectTeam } from "./ProjectTeam";
import { ProjectNotes } from "./ProjectNotes";
import { formatJobNumber } from "@/lib/format-job-number";

interface ProjectDetailsViewProps {
  project: any;
  onBack: () => void;
  onEdit: () => void;
}

export const ProjectDetailsView = ({ project, onBack, onEdit }: ProjectDetailsViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-production": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-primary/10 text-primary";
      case "quoted": return "bg-yellow-100 text-yellow-800";
      case "measuring": return "bg-orange-100 text-orange-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
          <Button onClick={onEdit}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="font-semibold">{formatCurrency(project.total_amount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-semibold">
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-semibold">Client #{project.client_id?.slice(0, 8) || 'Unassigned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-semibold">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Number</label>
                  <p className="font-mono">#{formatJobNumber(project.job_number)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p>{project.description || 'No description available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p>{new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <p>{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                  <p>{project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'Not completed'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <FileUpload projectId={project.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <ProjectTimeline projectId={project.id} />
        </TabsContent>

        <TabsContent value="team">
          <ProjectTeam projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
