import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Mail, Phone, MapPin, Users, Building2, User, FileText, DollarSign, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { ClientCreateForm } from "./ClientCreateForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const EnhancedClientManagement = () => {
  const { data: clients, isLoading } = useClients();
  const { data: quotes } = useQuotes();
  const { data: projects } = useProjects();
  const deleteClient = useDeleteClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getTypeColor = (type: string) => {
    return type === "B2B" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
  };

  const getTypeIcon = (type: string) => {
    return type === "B2B" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getClientStats = (clientId: string) => {
    const clientQuotes = quotes?.filter(q => q.client_id === clientId) || [];
    const clientProjects = projects?.filter(p => p.client_id === clientId) || [];
    const totalValue = clientQuotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
    const newestProject = clientProjects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return {
      jobsCount: clientQuotes.length,
      totalValue,
      newestProject,
      projectsCount: clientProjects.length
    };
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient.mutateAsync(clientId);
  };

  if (showCreateForm) {
    return <ClientCreateForm onBack={() => setShowCreateForm(false)} />;
  }

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clients?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">B2B Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clients?.filter(client => client.client_type === 'B2B').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">B2C Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {clients?.filter(client => client.client_type === 'B2C').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {clients?.filter(client => {
                const createdAt = new Date(client.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return createdAt > thirtyDaysAgo;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>Complete overview of your client relationships</CardDescription>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p>No clients found. Add your first client to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Latest Project</TableHead>
                  <TableHead>Communication</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const stats = getClientStats(client.id);
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {client.client_type === 'B2B' ? client.company_name : client.name}
                          </div>
                          {client.client_type === 'B2B' && client.contact_person && (
                            <div className="text-sm text-muted-foreground">
                              Contact: {client.contact_person}
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getTypeColor(client.client_type || 'B2C')} border-0 flex items-center space-x-1 w-fit`} variant="secondary">
                              {getTypeIcon(client.client_type || 'B2C')}
                              <span>{client.client_type || 'B2C'}</span>
                            </Badge>
                            {client.city && client.state && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="mr-1 h-3 w-3" />
                                {client.city}, {client.state}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-1 h-3 w-3" />
                              {client.email}
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="mr-1 h-3 w-3" />
                              {client.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-semibold text-blue-600">
                            {stats.jobsCount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            jobs
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {stats.totalValue.toLocaleString('en-US', { 
                              style: 'currency', 
                              currency: 'USD',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {stats.newestProject ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {stats.newestProject.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(stats.newestProject.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No projects</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            0 emails
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <FileText className="mr-1 h-3 w-3" />
                            {stats.projectsCount} docs
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" title="Send Email">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Call Client">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Delete Client"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this client? This action cannot be undone and will also delete all associated projects and quotes.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClient(client.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button variant="ghost" size="sm" title="View Details">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
