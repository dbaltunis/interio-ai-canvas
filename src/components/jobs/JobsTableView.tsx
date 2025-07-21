
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Copy } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";

interface JobsTableViewProps {
  onJobSelect?: (jobId: string) => void;
}

export const JobsTableView = ({ onJobSelect }: JobsTableViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: projects, isLoading } = useProjects();
  const { data: clients } = useClients();

  // Create client lookup
  const clientsMap = clients?.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, any>) || {};

  // Process jobs data from projects
  const jobs = projects?.map(project => {
    const client = project.client_id ? clientsMap[project.client_id] : null;
    
    return {
      id: project.id,
      jobNumber: project.job_number || `JOB-${project.id?.slice(0, 8)}`,
      name: project.name,
      clientName: client?.name || 'No client',
      value: 0, // Will be calculated from treatments/quotes later
      dateCreated: project.created_at,
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      description: project.description,
      client,
      project
    };
  }) || [];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      planning: "bg-blue-100 text-blue-800",
      active: "bg-brand-secondary text-white",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      on_hold: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleJobSelect = (jobId: string) => {
    if (onJobSelect) {
      onJobSelect(jobId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Job Number</TableHead>
              <TableHead className="font-semibold text-gray-900">Job Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Client Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Priority</TableHead>
              <TableHead className="font-semibold text-gray-900">Date Created</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="text-gray-500">
                    {searchTerm || statusFilter !== "all" ? "No jobs match your filters" : "No jobs found"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleJobSelect(job.id)}>
                  <TableCell className="font-medium text-brand-primary">
                    {job.jobNumber}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">{job.name}</span>
                      {job.description && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {job.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {job.clientName}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      job.priority === 'high' ? 'border-red-200 text-red-800' :
                      job.priority === 'medium' ? 'border-yellow-200 text-yellow-800' :
                      'border-green-200 text-green-800'
                    }>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {job.dateCreated ? new Date(job.dateCreated).toLocaleDateString() : 'No date'}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleJobSelect(job.id); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleJobSelect(job.id); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
    </div>
  );
};
