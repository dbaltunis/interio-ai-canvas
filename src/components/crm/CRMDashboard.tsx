
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Download, 
  Upload, 
  Search, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  User, 
  Building2,
  Mail,
  Calendar,
  DollarSign,
  FolderOpen
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useClientStats } from "@/hooks/useClientStats";
import { ClientCreateForm } from "../clients/ClientCreateForm";
import { ClientImportExport } from "../clients/ClientImportExport";
import { useToast } from "@/hooks/use-toast";

export const CRMDashboard = () => {
  const { data: clients, isLoading } = useClientStats();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalClients = clients?.length || 0;
  const totalValue = clients?.reduce((sum, client) => sum + client.totalValue, 0) || 0;
  const totalJobs = clients?.reduce((sum, client) => sum + client.jobCount, 0) || 0;

  const getTypeColor = (type: string) => {
    return type === "B2B" 
      ? "bg-blue-100 text-blue-800 border-blue-200" 
      : "bg-purple-100 text-purple-800 border-purple-200";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />;
  };

  const handleDeleteClient = (clientId: string) => {
    // Implementation would go here
    toast({
      title: "Delete Client",
      description: "Client deletion functionality to be implemented",
    });
  };

  if (showCreateForm) {
    return (
      <ClientCreateForm 
        onBack={() => setShowCreateForm(false)}
        clientId={editingClientId || undefined}
      />
    );
  }

  if (showImportExport) {
    return <ClientImportExport onBack={() => setShowImportExport(false)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-gray-600">Loading CRM dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Client Relationship Management</h1>
          <p className="text-gray-600 mt-1">Manage your clients, projects, and business relationships</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowImportExport(true)}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-2 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active client relationships</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">Active and completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Project Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalJobs > 0 ? Math.round(totalValue / totalJobs).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per project</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Portfolio</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!filteredClients || filteredClients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first client."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)} className="bg-brand-primary hover:bg-brand-accent text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Projects</TableHead>
                  <TableHead className="font-semibold">Emails</TableHead>
                  <TableHead className="font-semibold">Value</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {client.client_type === 'B2B' ? client.company_name : client.name}
                        </div>
                        {client.client_type === 'B2B' && client.contact_person && (
                          <div className="text-sm text-gray-500">
                            Contact: {client.contact_person}
                          </div>
                        )}
                        {client.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                            {client.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(client.client_type || 'B2C')} border flex items-center space-x-1 w-fit`} variant="secondary">
                        {getTypeIcon(client.client_type || 'B2C')}
                        <span>{client.client_type || 'B2C'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="mr-2 h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-xs">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2">📞</span>
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {client.jobCount} projects
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {client.emailCount} emails
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${client.totalValue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {client.city && client.state ? `${client.city}, ${client.state}` : "Not specified"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingClientId(client.id);
                              setShowCreateForm(true);
                            }}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View Projects
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
