import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Copy, 
  Archive,
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { JobWorkflowPage } from "./JobWorkflowPage";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { formatDistanceToNow } from "date-fns";

export const SimplifiedJobsPage = () => {
  const [showNewJobWorkflow, setShowNewJobWorkflow] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.job_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get client name by ID
  const getClientName = (clientId: string | null) => {
    if (!clientId) return "No Client";
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showNewJobWorkflow) {
    return (
      <JobWorkflowPage 
        onBack={() => setShowNewJobWorkflow(false)}
        jobId={selectedJobId}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">Jobs Dashboard</h1>
          <p className="text-brand-neutral mt-1">
            Manage your curtain and blind projects
          </p>
        </div>
        <Button 
          onClick={() => setShowNewJobWorkflow(true)}
          className="bg-brand-primary hover:bg-brand-accent text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold">{projects.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold">
                  ${projects.reduce((sum, p) => sum + (p.total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No jobs found</p>
              <Button 
                onClick={() => setShowNewJobWorkflow(true)}
                variant="outline"
              >
                Create your first job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-brand-primary">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.job_number || 'No Job #'}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getClientName(project.client_id)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {formatDistanceToNow(new Date(project.created_at))} ago
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${(project.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedJobId(project.id);
                        setShowNewJobWorkflow(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedJobId(project.id);
                        setShowNewJobWorkflow(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};