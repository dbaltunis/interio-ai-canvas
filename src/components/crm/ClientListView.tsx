
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  User,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { useUpdateClientStage, useDeleteClient } from "@/hooks/useClients";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import type { MenuItem } from "@/components/ui/three-dot-menu";

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
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const updateClientStage = useUpdateClientStage();
  const deleteClient = useDeleteClient();

  const handleDeleteClick = (client: any) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      setShowDeleteDialog(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const getStageConfig = (stage: string) => {
    return FUNNEL_STAGES.find(s => s.key === stage) || FUNNEL_STAGES[0];
  };

  const handleStatusChange = (clientId: string, newStage: string) => {
    updateClientStage.mutate({
      clientId,
      stage: newStage
    });
  };

  const getClientInitials = (client: any) => {
    const name = client.client_type === 'B2B' ? client.company_name : client.name;
    if (!name) return 'UN';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getClientAvatarColor = (client: any) => {
    const name = client.client_type === 'B2B' ? client.company_name : client.name;
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  const getClientMenuItems = (client: any): MenuItem[] => [
    {
      label: "View Client",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onClientClick(client)
    },
    {
      label: "Edit Client",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => console.log("Edit client:", client.id)
    },
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      onClick: () => console.log("Send email to:", client.email)
    },
    {
      label: "Call Client",
      icon: <Phone className="h-4 w-4" />,
      onClick: () => client.phone && window.open(`tel:${client.phone}`, '_self')
    },
    {
      label: "Delete Client",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => handleDeleteClick(client),
      variant: "destructive" as const
    }
  ];

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
              <TableHead>Location</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  Created
                  {sortField === 'created_at' && (
                    <div className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client) => {
              const stageConfig = getStageConfig(client.funnel_stage || 'lead');
              const StageIcon = stageConfig.icon;
              
              return (
                <TableRow 
                  key={client.id} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onClientClick(client)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${getClientAvatarColor(client)} text-white text-xs font-medium`}>
                          {getClientInitials(client)}
                        </AvatarFallback>
                      </Avatar>
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
                    <Select
                      value={client.funnel_stage || 'lead'}
                      onValueChange={(value) => handleStatusChange(client.id, value)}
                    >
                      <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <StageIcon className="w-3 h-3" />
                            {stageConfig.label}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FUNNEL_STAGES.map((stage) => {
                          const Icon = stage.icon;
                          return (
                            <SelectItem key={stage.key} value={stage.key}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-3 h-3" />
                                {stage.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {client.city && client.state ? `${client.city}, ${client.state}` : "Not specified"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div onClick={(e) => e.stopPropagation()}>
                      <ThreeDotMenu items={getClientMenuItems(client)} />
                    </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clientToDelete?.client_type === 'B2B' ? clientToDelete?.company_name : clientToDelete?.name}"? 
              This action cannot be undone. Any associated projects will remain but will no longer be linked to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteClient.isPending}
            >
              {deleteClient.isPending ? "Deleting..." : "Delete Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
