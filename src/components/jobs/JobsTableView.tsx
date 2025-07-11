import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, DollarSign, FileText, Building2, User, Home, Square, Palette } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobActionsMenu } from "./JobActionsMenu";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";

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
  const { data: jobStatuses } = useJobStatuses();

  const getStatusInfo = (status: string) => {
    const statusConfig = jobStatuses?.find(s => s.name.toLowerCase() === status.toLowerCase());
    if (statusConfig) {
      return {
        color: getStatusColorClass(statusConfig.color),
        name: statusConfig.name,
        action: statusConfig.action
      };
    }
    
    // Fallback to default colors if status not found
    return {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      name: status.charAt(0).toUpperCase() + status.slice(1),
      action: "editable"
    };
  };

  const getStatusColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': 'bg-gray-100 text-gray-800 border-gray-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'orange': 'bg-orange-100 text-orange-800 border-orange-200',
      'red': 'bg-red-100 text-red-800 border-red-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
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
            const statusInfo = getStatusInfo(quote.status);
            
            return (
              <TableRow 
                key={quote.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onJobSelect(quote.id)}
              >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onClientEdit?.(client.id);
                      }}
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
                  <ProjectDetailsCell project={project} />
                </TableCell>
                
                <TableCell>
                  <Badge className={`${statusInfo.color} text-xs`}>
                    {statusInfo.name.toUpperCase()}
                  </Badge>
                  {statusInfo.action === 'locked' && (
                    <div className="text-xs text-muted-foreground mt-1">🔒 Locked</div>
                  )}
                  {statusInfo.action === 'requires_reason' && (
                    <div className="text-xs text-muted-foreground mt-1">⚠️ Reason Required</div>
                  )}
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
                  <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
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

const ProjectDetailsCell = ({ project }: { project: any }) => {
  const { data: rooms } = useRooms(project?.id);
  const { data: surfaces } = useSurfaces(project?.id);  
  const { data: treatments } = useTreatments(project?.id);

  if (!project) {
    return <span className="text-muted-foreground text-sm">No project</span>;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{project.name}</div>
      
      <div className="flex items-center space-x-3">
        <Badge variant="outline" className={`text-xs ${
          project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
          project.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          project.status === 'planning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          'bg-gray-50 text-gray-700 border-gray-200'
        }`}>
          {project.status?.replace('_', ' ').toUpperCase() || 'DRAFT'}
        </Badge>
      </div>

      {/* Project Content Summary */}
      <div className="flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1 text-blue-600">
          <Home className="h-3 w-3" />
          <span>{rooms?.length || 0} rooms</span>
        </div>
        <div className="flex items-center space-x-1 text-green-600">
          <Square className="h-3 w-3" />
          <span>{surfaces?.length || 0} windows</span>
        </div>
        <div className="flex items-center space-x-1 text-purple-600">
          <Palette className="h-3 w-3" />
          <span>{treatments?.length || 0} treatments</span>
        </div>
      </div>

      {project.due_date && (
        <div className="text-xs text-orange-600 flex items-center">
          <Calendar className="mr-1 h-3 w-3" />
          Due: {new Date(project.due_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
