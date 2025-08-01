
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Phone, Mail, MapPin, Building2, User, Calendar, DollarSign, FileText, Clock, Home, Square, Palette } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { JobActionsMenu } from "./JobActionsMenu";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useTreatments } from "@/hooks/useTreatments";

interface JobCardProps {
  quote: any;
  client?: any;
  project?: any;
  onJobSelect: (jobId: string) => void;
  onClientEdit?: (clientId: string) => void;
  onJobCopy?: (jobId: string) => void;
  businessSettings?: any;
}

export const JobCard = ({ 
  quote, 
  client, 
  project, 
  onJobSelect, 
  onClientEdit,
  onJobCopy,
  businessSettings 
}: JobCardProps) => {
  // Fetch project data
  const { data: rooms } = useRooms(project?.id);
  const { data: surfaces } = useSurfaces(project?.id);  
  const { data: treatments } = useTreatments(project?.id);
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
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onJobSelect(quote.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{quote.quote_number}</h3>
              <Badge className={`${getStatusColor(quote.status)} text-xs`}>
                {quote.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Created {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={() => onJobSelect(quote.id)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onJobSelect(quote.id)}>
              <Edit className="h-3 w-3" />
            </Button>
            <JobActionsMenu 
              quote={quote}
              client={client}
              project={project}
              onJobCopy={onJobCopy}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client Information */}
        {client && (
          <div 
            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClientEdit?.(client.id);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {client.client_type === 'B2B' ? (
                    <Building2 className="h-4 w-4 text-blue-600" />
                  ) : (
                    <User className="h-4 w-4 text-purple-600" />
                  )}
                  <span className="font-medium">
                    {client.client_type === 'B2B' ? client.company_name : client.name}
                  </span>
                </div>
                
                {client.client_type === 'B2B' && client.contact_person && (
                  <p className="text-sm text-muted-foreground">
                    Contact: {client.contact_person}
                  </p>
                )}
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  {client.email && (
                    <span className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>
              
              <Badge variant="outline" className={`text-xs ${
                client.client_type === 'B2B' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {client.client_type || 'B2C'}
              </Badge>
            </div>
          </div>
        )}

        {/* Project Information with Rooms & Treatments */}
        {project && (
          <div className="p-3 bg-blue-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{project.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Job #{project.job_number || 'N/A'}
                </p>
                {project.due_date && (
                  <p className="text-xs text-orange-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: {new Date(project.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              
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
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Home className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">{rooms?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rooms</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Square className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">{surfaces?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Windows</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Palette className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">{treatments?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Treatments</p>
              </div>
            </div>

            {/* Room List */}
            {rooms && rooms.length > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <div className="flex flex-wrap gap-1">
                  {rooms.slice(0, 3).map((room: any) => (
                    <Badge key={room.id} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      {room.name}
                    </Badge>
                  ))}
                  {rooms.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      +{rooms.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Value */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium text-green-800">Total Value</span>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">
              {formatCurrency(quote.total_amount || 0)}
            </span>
          </div>
        </div>

        {/* Notes (if any) */}
        {quote.notes && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{quote.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
