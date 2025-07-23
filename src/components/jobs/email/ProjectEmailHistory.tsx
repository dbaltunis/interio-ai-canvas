
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Reply, 
  Forward, 
  Archive,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useEmails } from "@/hooks/useEmails";
import { format } from "date-fns";

interface ProjectEmailHistoryProps {
  projectId: string;
}

export const ProjectEmailHistory = ({ projectId }: ProjectEmailHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  
  const { data: emails = [] } = useEmails();
  
  // Filter emails for this project (you might want to add project_id to emails table)
  const projectEmails = emails.filter(email => {
    // For now, we'll show all emails - in a real implementation you'd filter by project_id
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || email.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "bounced":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "queued":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "bounced":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "queued":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === projectEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(projectEmails.map(email => email.id));
    }
  };

  // Group emails by date for better organization
  const groupedEmails = projectEmails.reduce((groups, email) => {
    const date = format(new Date(email.created_at), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(email);
    return groups;
  }, {} as Record<string, typeof projectEmails>);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search emails by subject or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedEmails.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
              <span className="text-sm text-blue-800">
                {selectedEmails.length} email(s) selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline">
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {Object.entries(groupedEmails).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No emails found</h3>
                <p className="text-gray-500">No emails match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedEmails)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, emails]) => (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email.id)}
                          onChange={() => handleSelectEmail(email.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{email.subject}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                To: {email.recipient_email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(email.status)} variant="outline">
                                {getStatusIcon(email.status)}
                                {email.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(email.created_at), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {email.open_count > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                Opened {email.open_count} time(s)
                              </span>
                            )}
                            {email.click_count > 0 && (
                              <span className="flex items-center gap-1">
                                Clicked {email.click_count} time(s)
                              </span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Reply className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                            <Button size="sm" variant="outline">
                              <Forward className="h-4 w-4 mr-1" />
                              Forward
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedEmails.length === projectEmails.length}
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email.id)}
                          onChange={() => handleSelectEmail(email.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell>{email.recipient_email}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(email.status)} variant="outline">
                          {getStatusIcon(email.status)}
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {email.sent_at ? format(new Date(email.sent_at), "MMM d, h:mm a") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-sm">
                          {email.open_count > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              {email.open_count} opens
                            </Badge>
                          )}
                          {email.click_count > 0 && (
                            <Badge variant="outline" className="text-blue-600">
                              {email.click_count} clicks
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Reply className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
