
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Copy, Calendar, User, DollarSign } from "lucide-react";

interface JobListViewProps {
  jobs: any[];
  onJobEdit: (jobId: string) => void;
  onJobView: (jobId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobListView = ({ jobs, onJobEdit, onJobView, onJobCopy }: JobListViewProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      planning: { bg: "bg-blue-100", text: "text-blue-800", label: "Planning" },
      active: { bg: "bg-brand-secondary", text: "text-white", label: "Active" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {config.label}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onJobView(job.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Job
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onJobEdit(job.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Job
                    </DropdownMenuItem>
                    {onJobCopy && (
                      <DropdownMenuItem onClick={() => onJobCopy(job.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate Job
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
