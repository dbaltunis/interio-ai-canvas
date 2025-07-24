
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientCreateForm } from "./ClientCreateForm";
import { ClientProfilePage } from "./ClientProfilePage";
import { ClientListView } from "../crm/ClientListView";
import { ClientFilters } from "./ClientFilters";
import { ClientImportExport } from "./ClientImportExport";
import { JobsPagination } from "../jobs/JobsPagination";

export const ClientManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [clientType, setClientType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: clients, isLoading } = useClients();

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = clientType === 'all' || client.client_type === clientType;
    
    return matchesSearch && matchesType;
  }) || [];

  // Pagination logic
  const totalItems = filteredClients.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setShowClientProfile(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setSelectedProjects([]);
    setClientType("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Show import/export if selected
  if (showImportExport) {
    return (
      <ClientImportExport
        onBack={() => setShowImportExport(false)}
      />
    );
  }

  // Show client profile if selected
  if (showClientProfile && selectedClient) {
    return (
      <ClientProfilePage
        clientId={selectedClient.id}
        onBack={() => {
          setShowClientProfile(false);
          setSelectedClient(null);
        }}
        onEdit={() => {
          console.log("Edit client:", selectedClient);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-brand-primary">Clients</h1>
          <div className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-medium">
            {totalItems} clients
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Import/Export
          </Button>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-primary hover:bg-brand-accent text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <ClientFilters
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            selectedStatuses={selectedStatuses}
            setSelectedStatuses={setSelectedStatuses}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            clientType={clientType}
            setClientType={setClientType}
            onClearFilters={clearFilters}
          />
        </div>
      )}

      {/* Client List */}
      <ClientListView
        clients={paginatedClients}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClientClick={handleClientClick}
      />

      {/* Pagination */}
      <JobsPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* New Client Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientCreateForm onBack={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
