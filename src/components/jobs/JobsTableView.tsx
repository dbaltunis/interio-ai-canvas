
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Mail, Calendar, DollarSign, FileText, Building2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobActionsMenu } from "./JobActionsMenu";

interface JobsTableViewProps {
  quotes: any[];
  clients?: any[];
  projects?: any[];
  onJobSelect: (jobId: string) => void;
  onClientEdit?: (clientId: string) => void;
  onJobCopy?: (jobId: string) => void;
  businessSettings?: any;
}

export const JobsTableView = ({
  quotes,
  clients,
  projects,
  onJobSelect,
  onClientEdit,
  onJobCopy,
  businessSettings
}: JobsTableViewProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatCurrency = (amount: number) => {
    let currency = 'USD';
    try {
      if (businessSettings?.measurement_units) {
        const units = JSON.parse(businessSettings.measurement_units);
        currency = units.currency || 'USD';
      }
    } catch (e) {
      console.warn('Could not parse measurement units:', e);
    }
    
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$', 
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };

    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString()}`;
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Details</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const client = clients?.find(c => c.id === quote.client_id);
            const project = projects?.find(p => p.id === quote.project_id);
            
            return (
              <TableRow key={quote.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{quote.quote_number}</div>
                    {project && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <FileText className="mr-1 h-3 w-3" />
                        Job #{project.job_number || 'N/A'}
                      </div>
                    )}
                    {quote.notes && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {quote.notes}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  {client ? (
                    <div 
                      className="cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                      onClick={() => onClientEdit?.(client.id)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium flex items-center space-x-1">
                          {client.client_type === 'B2B' ? (
                            <Building2 className="h-3 w-3 text-blue-600" />
                          ) : (
                            <User className="h-3 w-3 text-purple-600" />
                          )}
                          <span>{client.client_type === 'B2B' ? client.company_name : client.name}</span>
                        </div>
                        {client.client_type === 'B2B' && client.contact_person && (
                          <div className="text-xs text-muted-foreground">
                            Contact: {client.contact_person}
                          </div>
                        )}
                        <Badge variant="outline" className={`text-xs w-fit ${
                          client.client_type === 'B2B' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {client.client_type || 'B2C'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No client</span>
                  )}
                </TableCell>
                
                <TableCell>
                  {project ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{project.name}</div>
                      <Badge variant="outline" className={`text-xs ${
                        project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        project.status === 'planning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {project.status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
                      </Badge>
                      {project.due_date && (
                        <div className="text-xs text-orange-600 flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Due: {new Date(project.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No project</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge className={`${getStatusColor(quote.status)} text-xs`}>
                    {quote.status.toUpperCase()}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      {formatCurrency(quote.total_amount || 0)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>{new Date(quote.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onJobSelect(quote.id)}
                      title="View Job"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onJobSelect(quote.id)}
                      title="Edit Job"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {client?.email && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Send Email"
                        onClick={() => {
                          window.open(`/jobs?tab=emails&client=${client.id}&quote=${quote.id}`, '_blank');
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <JobActionsMenu 
                      quote={quote}
                      client={client}
                      project={project}
                      onJobCopy={onJobCopy}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
