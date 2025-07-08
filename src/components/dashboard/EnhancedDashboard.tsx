import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickStartGuide } from "./QuickStartGuide";
import { ProjectCreationWizard } from "../project-wizard/ProjectCreationWizard";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  FolderOpen, 
  Users, 
  FileText, 
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  User,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const EnhancedDashboard = () => {
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();
  
  const { data: projects } = useProjects();
  const { data: clients } = useClients();
  const { data: quotes } = useQuotes();

  const handleProjectCreated = (projectId: string) => {
    navigate(`/projects/${projectId}/jobs`);
  };

  const recentProjects = projects?.slice(0, 3) || [];
  const recentClients = clients?.slice(0, 3) || [];
  const recentQuotes = quotes?.slice(0, 3) || [];

  const totalValue = quotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;

  const stats = [
    {
      title: "Active Projects",
      value: projects?.length || 0,
      description: "Total projects in progress",
      icon: <FolderOpen className="h-5 w-5 text-blue-600" />,
      color: "bg-blue-100"
    },
    {
      title: "Total Clients",
      value: clients?.length || 0,
      description: "Registered clients",
      icon: <Users className="h-5 w-5 text-green-600" />,
      color: "bg-green-100"
    },
    {
      title: "Quotes Created",
      value: quotes?.length || 0,
      description: "All time quotes",
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      color: "bg-purple-100"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      description: "Combined quote value",
      icon: <DollarSign className="h-5 w-5 text-amber-600" />,
      color: "bg-amber-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your projects, clients, and window covering business</p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Quick Start Guide */}
      <QuickStartGuide />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="clients">Recent Clients</TabsTrigger>
          <TabsTrigger value="quotes">Recent Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Projects</CardTitle>
                <CardDescription>Your latest project activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}/jobs`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600">
                            Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{project.status}</Badge>
                        <Badge variant="secondary">{project.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No projects yet. Create your first project to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Clients</CardTitle>
                <CardDescription>Your latest client additions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/clients')}>
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentClients.length > 0 ? (
                <div className="space-y-4">
                  {recentClients.map((client) => (
                    <div 
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/clients')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${client.client_type === 'B2B' ? 'bg-blue-100' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                          {client.client_type === 'B2B' ? (
                            <Building2 className="h-5 w-5 text-blue-600" />
                          ) : (
                            <User className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {client.client_type === 'B2B' ? client.company_name : client.name}
                          </h4>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{client.client_type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No clients yet. Add clients through the project creation wizard!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Quotes</CardTitle>
                <CardDescription>Your latest quote activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentQuotes.length > 0 ? (
                <div className="space-y-4">
                  {recentQuotes.map((quote) => (
                    <div 
                      key={quote.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/jobs')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{quote.quote_number}</h4>
                          <p className="text-sm text-gray-600">
                            Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-600">
                          ${quote.total_amount?.toLocaleString() || 0}
                        </span>
                        <Badge variant="outline">{quote.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No quotes yet. Create projects and add treatments to generate quotes!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProjectCreationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};