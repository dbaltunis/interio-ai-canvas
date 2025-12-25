import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

import { Mail, Phone, User, Building2, MoreHorizontal, Star, Clock, FileText, Trash2, Calendar, FolderKanban } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { useIsTablet } from "@/hooks/use-tablet";
import { ClientDetailDrawer } from "./ClientDetailDrawer";
import { useDeleteClient } from "@/hooks/useClients";
import { toast } from "sonner";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { useClientFilesCount } from "@/hooks/useClientFilesCount";
import { BulkActionsBar } from "./BulkActionsBar";
import { CampaignWizard } from "@/components/campaigns/CampaignWizard";
import { useClientSelection, SelectedClient } from "@/hooks/useClientSelection";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  client_type?: string;
  company_name?: string;
  contact_person?: string;
  city?: string;
  state?: string;
  created_at: string;
  notes?: string;
  projectCount?: number;
  totalValue?: number;
  lead_score?: number;
  funnel_stage?: string;
  priority_level?: string;
  lead_source?: string;
  follow_up_date?: string;
  last_contact_date?: string;
  deal_value?: number;
  conversion_probability?: number;
  tags?: string[];
  referral_source?: string;
}

interface ClientListViewProps {
  clients: Client[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClientClick: (client: Client) => void;
  isLoading: boolean;
  canDeleteClients?: boolean;
}

export const ClientListView = ({ clients, onClientClick, isLoading, canDeleteClients = false }: ClientListViewProps) => {
  const isTablet = useIsTablet();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const deleteClient = useDeleteClient();
  const { formatCurrency } = useFormattedCurrency();
  
  // Multi-selection
  const {
    selectedClients,
    selectedCount,
    selectedWithEmails,
    toggleClient,
    selectAll,
    clearSelection,
    isSelected,
  } = useClientSelection();
  
  // Get client IDs for files count query
  const clientIds = useMemo(() => clients?.map(c => c.id) || [], [clients]);
  const { data: filesCount } = useClientFilesCount(clientIds);

  // Convert clients for selection
  const selectableClients: SelectedClient[] = useMemo(() => 
    clients?.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      company_name: c.company_name,
      funnel_stage: c.funnel_stage,
    })) || [], 
    [clients]
  );

  const allSelected = selectedCount === clients?.length && clients?.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(selectableClients);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    toggleClient({
      id: client.id,
      name: client.name,
      email: client.email,
      company_name: client.company_name,
      funnel_stage: client.funnel_stage,
    });
  };

  const handleExportSelected = () => {
    // Export logic - for now just show a toast
    toast.success(`Exporting ${selectedCount} clients...`);
  };

  const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!canDeleteClients) {
      toast.error("You don't have permission to delete clients");
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      return;
    }

    if (clientToDelete) {
      deleteClient.mutate(clientToDelete.id, {
        onSuccess: () => {
          toast.success(`Client "${clientToDelete.name}" has been deleted`);
          setDeleteDialogOpen(false);
          setClientToDelete(null);
        },
        onError: (error) => {
          toast.error("Failed to delete client");
          console.error("Delete error:", error);
        }
      });
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
    onClientClick(client);
  };

  const getClientAvatarColor = (clientName: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-cyan-500'
    ];
    const index = clientName.length % colors.length;
    return colors[index];
  };

  const getTypeColor = (type: string) => {
    return type === "B2B" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-secondary text-secondary-foreground";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case 'lead':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'qualified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'negotiation':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'client':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'qualification':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'closed_won':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed_lost':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const isHotLead = (score: number) => score >= 70;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-0">
        {!clients || clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or add a new client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium w-12">#</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Stage</TableHead>
                  {!isTablet && <TableHead className="text-muted-foreground font-medium">Projects</TableHead>}
                  {!isTablet && <TableHead className="text-muted-foreground font-medium">Total Value</TableHead>}
                  {!isTablet && <TableHead className="text-muted-foreground font-medium">Last Activity</TableHead>}
                  {!isTablet && <TableHead className="text-muted-foreground font-medium">Documents</TableHead>}
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => {
                  const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
                  const initials = (displayName || 'U').substring(0, 2).toUpperCase();
                  const avatarColor = getClientAvatarColor(displayName || 'Unknown');
                  const clientIsSelected = isSelected(client.id);
                  
                  return (
                  <TableRow 
                    key={client.id} 
                    className={`hover:bg-muted/50 cursor-pointer border-border/50 ${clientIsSelected ? 'bg-primary/5' : ''}`}
                    onClick={() => handleClientClick(client)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={clientIsSelected}
                        onCheckedChange={() => handleCheckboxClick({ stopPropagation: () => {} } as any, client)}
                        onClick={(e) => handleCheckboxClick(e, client)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {index + 1}
                    </TableCell>
                    
                    <TableCell className="font-medium max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate flex items-center gap-2">
                            <span className="truncate max-w-[200px]">
                              {client.client_type === 'B2B' ? client.company_name : client.name}
                            </span>
                            {(client.lead_score && isHotLead(client.lead_score)) && (
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          {client.client_type === 'B2B' && client.contact_person && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {client.contact_person}
                            </div>
                          )}
                          {client.email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {client.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${getStageColor(client.funnel_stage || 'lead')} border text-xs font-medium`} variant="outline">
                        {(client.funnel_stage || 'lead').replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    
                    {!isTablet && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          <FolderKanban className="h-3 w-3" />
                          {client.projectCount || 0}
                        </Badge>
                      </TableCell>
                    )}
                    
                    {!isTablet && (
                      <TableCell>
                        {client.totalValue && client.totalValue > 0 ? (
                          <div className="font-bold text-foreground">
                            {formatCurrency(client.totalValue)}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">—</div>
                        )}
                      </TableCell>
                    )}
                    
                    {!isTablet && (
                      <TableCell>
                        {client.last_contact_date ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(client.last_contact_date), { addSuffix: true })}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm">No activity</div>
                        )}
                      </TableCell>
                    )}
                    
                    {!isTablet && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {filesCount?.[client.id] || 0}
                          </Badge>
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Meeting
                          </DropdownMenuItem>
                          {canDeleteClients && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(e, client)}
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Client
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <ClientDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        client={selectedClient}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
              </p>
              <p className="text-destructive font-medium">
                This action cannot be undone. The following data will be permanently deleted:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>All client details and contact information</li>
                <li>All attachments and files</li>
                <li>All scheduled events and meetings</li>
                <li>All associated jobs and projects</li>
                <li>All quotes and invoices</li>
                <li>All activity history and notes</li>
              </ul>
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

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedCount}
        selectedWithEmailsCount={selectedWithEmails.length}
        onStartCampaign={() => setShowCampaignWizard(true)}
        onExport={handleExportSelected}
        onClearSelection={clearSelection}
      />

      {/* Campaign Wizard */}
      <CampaignWizard
        open={showCampaignWizard}
        onOpenChange={setShowCampaignWizard}
        selectedClients={selectedClients}
        onComplete={clearSelection}
      />
    </Card>
  );
};