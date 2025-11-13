import { Card, CardContent } from "@/components/ui/card";
import { formatJobNumber } from "@/lib/format-job-number";
import { User, Calendar, DollarSign, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActionsMenu } from "./JobActionsMenu";
import { formatCurrency } from "@/utils/currency";
import { DuplicateJobIndicator } from "./DuplicateJobIndicator";
import { ArchiveIndicator } from "./ArchiveIndicator";
import { useJobStatuses } from "@/hooks/useJobStatuses";

interface JobGridViewProps {
  jobs: any[];
  onJobView: (jobId: string) => void;
  onJobEdit: (jobId: string) => void;
  onJobCopy?: (jobId: string) => void;
}

export const JobGridView = ({ jobs, onJobView, onJobEdit, onJobCopy }: JobGridViewProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  
  // Count duplicates for each job
  const duplicateCounts = jobs.reduce((acc, job) => {
    if (job.parent_job_id) {
      acc[job.parent_job_id] = (acc[job.parent_job_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => {
        const isDuplicate = !!job.parent_job_id;
        const duplicateCount = duplicateCounts[job.id] || 0;
        
        // Check if job is archived
        const isArchived = (() => {
          if (!job.status_id) return false;
          const status = jobStatuses.find(s => s.id === job.status_id);
          return status?.name?.toLowerCase().includes('completed') || false;
        })();
        
        return (
          <Card 
            key={job.id} 
            className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-brand-secondary cursor-pointer"
            onClick={() => onJobView(job.id)}
          >
            <CardContent className="p-6">
              {/* Header with Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-lg text-gray-900">
                      {formatJobNumber(job.job_number)}
                    </span>
                    <DuplicateJobIndicator 
                      isDuplicate={isDuplicate}
                      duplicateCount={duplicateCount}
                      className="ml-auto"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <JobStatusBadge statusId={job.status_id || null} fallbackText={job.status || "No Status"} />
                    <ArchiveIndicator isArchived={isArchived} />
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} className="ml-2">
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
        );
      })}
    </div>
  );
};
