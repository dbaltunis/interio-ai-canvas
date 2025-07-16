
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, DollarSign, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActionsMenu } from "./JobActionsMenu";

interface JobListViewProps {
  jobs: any[];
  onJobView: (jobId: string) => void;
  onJobEdit: (jobId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobListView = ({ jobs, onJobView, onJobEdit, onJobCopy }: JobListViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 border">
        <div>Job Number</div>
        <div>Client Name</div>
        <div>Value</div>
        <div>Date Created</div>
        <div>Status</div>
        <div>User</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Job Rows */}
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-brand-secondary cursor-pointer"
          onClick={() => onJobView(job.id)}
        >
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-4 items-center px-6 py-4">
              {/* Job Number */}
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {job.job_number}
                </span>
              </div>

              {/* Client Name */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.client?.name || 'No client'}
                </span>
              </div>

              {/* Value */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {formatCurrency(job.total_amount)}
                </span>
              </div>

              {/* Date Created */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                </span>
              </div>

              {/* Status */}
              <div>
                <JobStatusBadge status={job.status} />
              </div>

              {/* User */}
              <div className="text-sm text-gray-600">
                System User
              </div>

              {/* Actions */}
              <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                <JobActionsMenu 
                  quote={job}
                  client={job.client}
                  project={job.project}
                  onJobCopy={onJobCopy}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
