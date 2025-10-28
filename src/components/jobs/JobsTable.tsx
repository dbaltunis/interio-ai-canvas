import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { FileText } from "lucide-react";
import { JobActionsMenu } from "./JobActionsMenu";
import { formatJobNumber } from "@/lib/format-job-number";
import { MaterialsStatusBadge } from "./MaterialsStatusBadge";
import { useNavigate } from "react-router-dom";

interface JobsTableProps {
  searchClient: string;
  searchJobNumber: string;
  filterStatus: string;
  filterDeposit: string;
  filterOwner: string;
  filterMaker: string;
  onJobSelect?: (jobId: string) => void;
}

export const JobsTable = ({ 
  searchClient,
  searchJobNumber,
  filterStatus,
  filterDeposit,
  filterOwner,
  filterMaker,
  onJobSelect
}: JobsTableProps) => {
  const navigate = useNavigate();
  const { data: quotes } = useQuotes();
  const { data: projects } = useProjects();
  const { data: clients } = useClients();

  // Filter quotes based on search and filter criteria
  const filteredQuotes = quotes?.filter(quote => {
    const project = projects?.find(p => p.id === quote.project_id);
    const client = clients?.find(c => c.id === quote.client_id);
    
    const matchesClient = !searchClient || 
      (client?.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
       client?.company_name?.toLowerCase().includes(searchClient.toLowerCase()));
    const matchesJobNumber = !searchJobNumber || 
      (quote.quote_number.toLowerCase().includes(searchJobNumber.toLowerCase()) ||
       project?.job_number?.toLowerCase().includes(searchJobNumber.toLowerCase()));
    const matchesStatus = filterStatus === "all" || quote.status === filterStatus;
    
    return matchesClient && matchesJobNumber && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-secondary/20 text-secondary-foreground";
      case "order": return "bg-blue-100 text-blue-800";
      case "invoice": return "bg-primary/10 text-primary";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-secondary/20 text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Quote";
      case "order": return "Order";
      case "invoice": return "Invoice";
      case "completed": return "Completed";
      default: return "Quote";
    }
  };

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No jobs yet</h3>
          <p className="text-muted-foreground">
            Create your first job to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Table Header */}
      <div className="grid grid-cols-9 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
        <div>Job No.</div>
        <div>Quote Total</div>
        <div>Payment</div>
        <div>Client Name</div>
        <div>Mobile</div>
        <div>Calendar</div>
        <div>Status</div>
        <div>Materials</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y">
        {filteredQuotes.map((quote) => {
          const project = projects?.find(p => p.id === quote.project_id);
          const client = clients?.find(c => c.id === quote.client_id);
          const displayName = client?.client_type === 'B2B' ? client?.company_name : client?.name;
          
          return (
            <div 
              key={quote.id} 
              className="grid grid-cols-9 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
              onClick={() => onJobSelect?.(quote.id)}
            >
              <div>
                <div className="text-xs text-muted-foreground font-mono">{formatJobNumber(project?.job_number)}</div>
                <div className="text-xs text-gray-500">{quote.quote_number}</div>
              </div>
              <div className="font-medium">${quote.total_amount?.toFixed(2) || '0.00'}</div>
              <div className="text-gray-500">-</div>
              <div className="text-gray-900">
                <div>{displayName || 'Unknown Client'}</div>
                {client?.client_type && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {client.client_type}
                  </Badge>
                )}
              </div>
              <div className="text-gray-500">{client?.phone || '-'}</div>
              <div className="text-gray-900">{new Date(quote.created_at).toLocaleDateString('en-GB')}</div>
              <div>
                <Badge className={`${getStatusColor(quote.status)} border-0`} variant="secondary">
                  {getStatusLabel(quote.status)}
                </Badge>
              </div>
              <div>
                <div className="flex flex-col gap-1">
                  <MaterialsStatusBadge status={quote.materials_status} />
                  {quote.materials_status === 'not_processed' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/?tab=ordering-hub`);
                      }}
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-6 h-6 bg-slate-600 rounded-full mr-2 flex items-center justify-center text-white text-xs">
                    A
                  </div>
                  <span>InterioApp Admin</span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <JobActionsMenu 
                    quote={quote}
                    client={client}
                    project={project}
                    onJobCopy={(jobId) => console.log('Copy job:', jobId)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
