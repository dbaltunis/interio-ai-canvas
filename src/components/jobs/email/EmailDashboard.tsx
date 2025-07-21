
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Filter, Eye, Archive, Trash2, Download } from "lucide-react";
import { useEmails, useEmailKPIs } from "@/hooks/useEmails";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { format } from "date-fns";

export const EmailDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const { data: emails = [] } = useEmails();
  const { data: kpis } = useEmailKPIs();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "queued":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    const matchesClient = clientFilter === "all" || email.client_id === clientFilter;
    const matchesProject = projectFilter === "all" || 
                          projects.find(p => p.client_id === email.client_id)?.id === projectFilter;
    
    return matchesSearch && matchesStatus && matchesClient && matchesProject;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis?.totalSent || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis?.openRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis?.clickRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Archive className="w-4 h-4 mr-2" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kpis?.deliveryRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardContent className="p-0">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No emails found</h3>
              <p className="text-gray-500 mb-4">No emails match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Recipient</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Sent</TableHead>
                  <TableHead className="font-semibold">Engagement</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.map((email) => (
                  <TableRow key={email.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{email.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {email.recipient_email}
                        {email.client_id && (
                          <div className="text-xs text-gray-500">
                            {clients.find(c => c.id === email.client_id)?.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(email.status)} border-0`} variant="secondary">
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {email.sent_at ? format(new Date(email.sent_at), 'MMM d, yyyy HH:mm') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-xs">
                        {email.open_count > 0 && (
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            {email.open_count} opens
                          </Badge>
                        )}
                        {email.click_count > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {email.click_count} clicks
                          </Badge>
                        )}
                        {email.open_count === 0 && email.click_count === 0 && email.status === 'delivered' && (
                          <span className="text-gray-400">No activity</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
