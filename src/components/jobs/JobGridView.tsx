
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, DollarSign, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActionsMenu } from "./JobActionsMenu";
import { formatCurrency } from "@/utils/currency";

interface JobGridViewProps {
  jobs: any[];
  onJobView: (jobId: string) => void;
  onJobEdit: (jobId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobGridView = ({ jobs, onJobView, onJobEdit, onJobCopy }: JobGridViewProps) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-brand-secondary cursor-pointer"
          onClick={() => onJobView(job.id)}
        >
          <CardContent className="p-6">
            {/* Header with Actions */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-lg text-gray-900">
                    {job.job_number}
                  </span>
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <JobActionsMenu 
                  quote={job}
                  client={job.client}
                  project={job.project}
                  onJobCopy={onJobCopy}
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.client?.name || 'No client assigned'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {formatCurrency(job.total_amount || 0)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'No date'}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <span className="text-gray-500">User:</span> System User
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
