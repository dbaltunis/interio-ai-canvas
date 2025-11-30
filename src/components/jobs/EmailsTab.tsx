
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Plus, Send, Archive, Trash2, Eye, Clock, TrendingUp, Users, MousePointer } from "lucide-react";

export const EmailsTab = () => {
  // TODO: Replace with real email data from database
  const emails = [
    {
      id: "1",
      subject: "Quote Follow-up - Kitchen Renovation",
      recipient: "john.doe@email.com",
      status: "sent",
      sentAt: "2024-01-15 10:30 AM",
      opened: true,
      clicked: false
    },
    {
      id: "2", 
      subject: "Project Update - Living Room Design",
      recipient: "jane.smith@email.com",
      status: "delivered",
      sentAt: "2024-01-14 2:15 PM",
      opened: false,
      clicked: false
    },
    {
      id: "3",
      subject: "Payment Reminder - Invoice #1024",
      recipient: "client@company.com",
      status: "bounced",
      sentAt: "2024-01-13 9:45 AM", 
      opened: false,
      clicked: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "delivered": 
        return "bg-blue-100 text-blue-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Email History</h1>
          <p className="text-gray-600 mt-1">View and manage sent emails</p>
        </div>
        <Button variant="brand" size="default">
          <Plus className="w-4 h-4 mr-2" />
          Compose Email
        </Button>
      </div>

      {/* Simple Status Banner */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">✅ Email Service Active</p>
              <p className="text-xs text-green-700">500 emails/month • Advanced tracking included</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {emails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No emails found</h3>
              <p className="text-gray-500 mb-4">Start your email marketing campaigns.</p>
              <Button className="bg-brand-primary hover:bg-brand-accent text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Email
              </Button>
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
                {emails.map((email) => (
                  <TableRow key={email.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{email.subject}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{email.recipient}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(email.status)} border-0`} variant="secondary">
                        {email.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{email.sentAt}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-xs">
                        {email.opened && <Badge variant="outline" className="text-green-600 border-green-300">Opened</Badge>}
                        {email.clicked && <Badge variant="outline" className="text-blue-600 border-blue-300">Clicked</Badge>}
                        {!email.opened && !email.clicked && <span className="text-gray-400">No activity</span>}
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
