import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Copy, Calendar, User, DollarSign } from "lucide-react";
import { JobActionsMenu } from "./JobActionsMenu";
import { useJobStatuses } from "@/hooks/useJobStatuses";

interface JobListViewProps {
  jobs: any[];
  onJobEdit: (jobId: string) => void;
  onJobView: (jobId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobListView = ({ jobs, onJobEdit, onJobView, onJobCopy }: JobListViewProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  
  const getStatusBadge = (status: string) => {
    // Find status details from database
    const statusDetails = jobStatuses.find(
      s => s.name.toLowerCase() === status.toLowerCase()
    );
    
    if (statusDetails) {
      const colorMap: Record<string, string> = {
        'gray': 'bg-gray-100 text-gray-800',
        'blue': 'bg-blue-100 text-blue-800', 
        'green': 'bg-green-100 text-green-800',
        'yellow': 'bg-yellow-100 text-yellow-800',
        'orange': 'bg-orange-100 text-orange-800',
        'red': 'bg-red-100 text-red-800',
        'primary': 'bg-primary/10 text-primary',
      };
      const colorClass = colorMap[statusDetails.color] || 'bg-gray-100 text-gray-800';
      
      return (
        <Badge className={`${colorClass} hover:${colorClass}`}>
          {statusDetails.name}
        </Badge>
      );
    }
    
    // Fallback for unknown statuses
    return (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
        {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ') || "Unknown"}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Medium" },
      high: { bg: "bg-orange-100", text: "text-orange-800", label: "High" },
      urgent: { bg: "bg-red-100", text: "text-red-800", label: "Urgent" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} border-none`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-900 w-32">Job Number</TableHead>
            <TableHead className="font-semibold text-gray-900">Job Title</TableHead>
            <TableHead className="font-semibold text-gray-900">Client</TableHead>
            <TableHead className="font-semibold text-gray-900">Owner</TableHead>
            <TableHead className="font-semibold text-gray-900 w-24">Status</TableHead>
            <TableHead className="font-semibold text-gray-900 w-24">Priority</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Value</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Date Created</TableHead>
            <TableHead className="font-semibold text-gray-900 w-32">Due Date</TableHead>
            <TableHead className="font-semibold text-gray-900 w-20 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id} className="hover:bg-gray-50 cursor-pointer group">
              <TableCell 
                className="font-medium text-brand-primary hover:underline"
                onClick={() => onJobView(job.id)}
              >
                #{job.job_number}
              </TableCell>
              
              <TableCell 
                className="font-medium text-gray-900 group-hover:text-brand-primary"
                onClick={() => onJobView(job.id)}
              >
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
                {job.client ? (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">{job.client.name}</span>
                      {job.client.company_name && (
                        <span className="text-xs text-gray-500">{job.client.company_name}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No client</span>
                )}
              </TableCell>

              <TableCell className="text-gray-900">
                {job.owner ? (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{job.owner.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No owner</span>
                )}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(job.status)}
              </TableCell>
              
              <TableCell>
                {getPriorityBadge(job.priority || 'medium')}
              </TableCell>
              
              <TableCell className="font-medium text-gray-900">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{formatCurrency(job.total_amount || 0)}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(job.created_at)}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-gray-600">
                {job.due_date ? (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(job.due_date)}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">No due date</span>
                )}
              </TableCell>
              
              <TableCell className="text-center">
                <div onClick={(e) => e.stopPropagation()}>
                  <JobActionsMenu 
                    quote={job}
                    client={job.client}
                    project={job.project}
                    onJobCopy={onJobCopy}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
