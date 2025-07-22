
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Mail, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Settings, 
  Clock,
  Eye,
  Phone,
  Building2,
  User
} from "lucide-react";
import { ClientStatusChanger } from "../clients/ClientStatusChanger";
import { QuickMeasurementAccess } from "../clients/QuickMeasurementAccess";

const FUNNEL_STAGES = [
  { key: "lead", label: "Lead", icon: User, color: "bg-gray-100 text-gray-800" },
  { key: "contacted", label: "Contacted", icon: Mail, color: "bg-blue-100 text-blue-800" },
  { key: "measuring_scheduled", label: "Measuring", icon: Calendar, color: "bg-yellow-100 text-yellow-800" },
  { key: "quoted", label: "Quoted", icon: FileText, color: "bg-purple-100 text-purple-800" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { key: "in_production", label: "In Production", icon: Settings, color: "bg-orange-100 text-orange-800" },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "bg-emerald-100 text-emerald-800" }
];

interface ClientListViewProps {
  clients: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClientClick: (client: any) => void;
}

export const ClientListView = ({ 
  clients, 
  searchTerm, 
  onSearchChange, 
  onClientClick 
}: ClientListViewProps) => {
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getStageConfig = (stage: string) => {
    return FUNNEL_STAGES.find(s => s.key === stage) || FUNNEL_STAGES[0];
  };

  const sortedClients = [...clients].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'name') {
      aValue = a.client_type === 'B2B' ? a.company_name : a.name;
      bValue = b.client_type === 'B2B' ? b.company_name : b.name;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Client
                  {sortField === 'name' && (
                    <div className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('funnel_stage')}
              >
                <div className="flex items-center gap-2">
                  Stage
                  {sortField === 'funnel_stage' && (
                    <div className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('last_contact_date')}
              >
                <div className="flex items-center gap-2">
                  Last Contact
                  {sortField === 'last_contact_date' && (
                    <div className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead>Quick Actions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client) => {
              const stageConfig = getStageConfig(client.funnel_stage || 'lead');
              const StageIcon = stageConfig.icon;
              
              return (
                <TableRow key={client.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {client.client_type === 'B2B' ? (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="font-medium">
                          {client.client_type === 'B2B' ? client.company_name : client.name}
                        </div>
                      </div>
                      {client.client_type === 'B2B' && client.name && (
                        <div className="text-sm text-muted-foreground ml-6">
                          Contact: {client.name}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className={stageConfig.color}>
                      <StageIcon className="w-3 h-3 mr-1" />
                      {stageConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {client.last_contact_date ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(client.last_contact_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <ClientStatusChanger
                        clientId={client.id}
                        currentStatus={client.funnel_stage || 'lead'}
                        clientName={client.client_type === 'B2B' ? client.company_name : client.name}
                      />
                      <QuickMeasurementAccess
                        clientId={client.id}
                        clientName={client.client_type === 'B2B' ? client.company_name : client.name}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClientClick(client)}
                      className="w-full"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first client to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
