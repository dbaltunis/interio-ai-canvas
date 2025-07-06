
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mail, Phone, MapPin, Users, Building2, User, FileText, DollarSign, Calendar, MessageSquare, Trash2, Eye, MousePointer } from "lucide-react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useAllClientEmailStats } from "@/hooks/useClientEmails";
import { ClientCreateForm } from "./ClientCreateForm";
import { ClientEmailHistory } from "./ClientEmailHistory";
import { ClientActivityTimeline } from "./ClientActivityTimeline";
import { ClientFollowUpReminders } from "./ClientFollowUpReminders";
import { DocumentManagement } from "@/components/files/DocumentManagement";
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
  const { data: emailStats } = useAllClientEmailStats();
  const deleteClient = useDeleteClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

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

    // Get email stats for this client
    const clientEmailStats = emailStats?.[clientId] || {
      totalEmails: 0,
      sentEmails: 0,
      openedEmails: 0,
      clickedEmails: 0,
      totalOpens: 0,
      totalClicks: 0,
      lastEmailDate: null
    };

    return {
      jobsCount: clientQuotes.length,
      totalValue,
      newestProject,
      projectsCount: clientProjects.length,
      emailStats: clientEmailStats
    };
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient.mutateAsync(clientId);
  };

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(selectedClientId === clientId ? null : clientId);
  };

  if (showCreateForm) {
    return <ClientCreateForm onBack={() => setShowCreateForm(false)} />;
  }

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  const selectedClient = clients?.find(c => c.id === selectedClientId);
  const clientProjects = projects?.filter(p => p.client_id === selectedClientId) || [];
  const clientQuotes = quotes?.filter(q => q.client_id === selectedClientId) || [];

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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Management</h2>
          <p className="text-muted-foreground">
            Complete CRM overview of your client relationships
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Main Content */}
      {selectedClient ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">
                {selectedClient.client_type === 'B2B' ? selectedClient.company_name : selectedClient.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={`${getTypeColor(selectedClient.client_type || 'B2C')} border-0 flex items-center space-x-1 w-fit`} variant="secondary">
                  {getTypeIcon(selectedClient.client_type || 'B2C')}
                  <span>{selectedClient.client_type || 'B2C'}</span>
                </Badge>
                {selectedClient.email && (
                  <span className="text-sm text-muted-foreground">{selectedClient.email}</span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={() => setSelectedClientId(null)}>
              Back to All Clients
            </Button>
          </div>

          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
            <TabsTrigger value="reminders">Follow-ups</TabsTrigger>
            <TabsTrigger value="emails">Email History</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Client overview content */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedClient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedClient.email}</span>
                    </div>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.city && selectedClient.state && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedClient.city}, {selectedClient.state}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const stats = getClientStats(selectedClient.id);
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Active Projects:</span>
                          <span className="font-medium">{stats.projectsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Jobs:</span>
                          <span className="font-medium">{stats.jobsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium text-green-600">
                            {stats.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email Communications:</span>
                          <span className="font-medium">{stats.emailStats.totalEmails}</span>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <ClientActivityTimeline clientId={selectedClient.id} />
          </TabsContent>

          <TabsContent value="reminders">
            <ClientFollowUpReminders 
              clientId={selectedClient.id} 
              clientName={selectedClient.client_type === 'B2B' ? selectedClient.company_name! : selectedClient.name}
            />
          </TabsContent>

          <TabsContent value="emails">
            <ClientEmailHistory 
              clientId={selectedClient.id} 
              clientEmail={selectedClient.email || undefined}
            />
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Client Projects & Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    All projects and quotes associated with this client
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {clientProjects.length} Projects
                  </Badge>
                  <Badge variant="outline">
                    {clientQuotes.length} Quotes
                  </Badge>
                </div>
              </div>

              {/* Projects Section */}
              {clientProjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{project.name}</div>
                                {project.description && (
                                  <div className="text-sm text-muted-foreground">{project.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{project.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{project.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                            </TableCell>
                            <TableCell>
                              {project.total_amount ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.total_amount) 
                                : 'TBD'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Quotes Section */}
              {clientQuotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quote Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Valid Until</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientQuotes.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell className="font-medium">{quote.quote_number}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{quote.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.total_amount)}
                            </TableCell>
                            <TableCell>
                              {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry'}
                            </TableCell>
                            <TableCell>
                              {new Date(quote.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {clientProjects.length === 0 && clientQuotes.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No projects or quotes found for this client</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Client Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Documents and files related to this client's projects
                </p>
              </div>
              
              {clientProjects.length > 0 ? (
                <div className="space-y-4">
                  {clientProjects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <CardDescription>Project documents and files</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DocumentManagement projectId={project.id} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No projects found - create a project to upload documents</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        /* ... keep existing code (clients table) */
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>Click on a client to view detailed information</CardDescription>
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
                    <TableHead>Business</TableHead>
                    <TableHead>Email Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const stats = getClientStats(client.id);
                    return (
                      <TableRow 
                        key={client.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleClientClick(client.id)}
                      >
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
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-blue-600">
                                {stats.jobsCount}
                              </span>
                              <span className="text-sm text-muted-foreground">jobs</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                {stats.totalValue.toLocaleString('en-US', { 
                                  style: 'currency', 
                                  currency: 'USD',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                })}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <MessageSquare className="mr-1 h-3 w-3" />
                                {stats.emailStats.totalEmails}
                              </Badge>
                              {stats.emailStats.totalOpens > 0 && (
                                <Badge variant="outline" className="text-xs text-purple-600">
                                  <Eye className="mr-1 h-3 w-3" />
                                  {stats.emailStats.totalOpens}
                                </Badge>
                              )}
                              {stats.emailStats.totalClicks > 0 && (
                                <Badge variant="outline" className="text-xs text-orange-600">
                                  <MousePointer className="mr-1 h-3 w-3" />
                                  {stats.emailStats.totalClicks}
                                </Badge>
                              )}
                            </div>
                            {stats.emailStats.lastEmailDate && (
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                Last: {new Date(stats.emailStats.lastEmailDate).toLocaleDateString()}
                              </div>
                            )}
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
                                  onClick={(e) => e.stopPropagation()}
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
      )}
    </div>
  );
};
