
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Plus, Send, Archive, Trash2, Eye, Clock, TrendingUp, Users, MousePointer } from "lucide-react";

export const EmailsTab = () => {
  // Mock email data for demonstration
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

  // Calculate email metrics
  const emailKPIs = {
    totalSent: emails.length,
    delivered: emails.filter(e => e.status === "delivered" || e.status === "sent").length,
    bounced: emails.filter(e => e.status === "bounced").length,
    openRate: 65.4,
    clickRate: 23.1,
    deliveryRate: 98.2,
    avgTimeSpent: "2m 34s",
    totalOpenCount: 127,
    totalClickCount: 45,
    totalOpened: emails.filter(e => e.opened).length,
    totalClicked: emails.filter(e => e.clicked).length,
    totalDelivered: emails.filter(e => e.status === "delivered" || e.status === "sent").length
  };

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
          <h1 className="text-3xl font-bold text-brand-primary">Email Management</h1>
          <p className="text-gray-600 mt-1">Manage your email campaigns and communications</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent text-white px-6 font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Compose Email
        </Button>
      </div>

      {/* Email KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emailKPIs.totalSent}</div>
            <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
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
            <div className="text-2xl font-bold text-green-600">{emailKPIs.openRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Industry avg: 21.3%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MousePointer className="w-4 h-4 mr-2" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{emailKPIs.clickRate}%</div>
            <p className="text-xs text-gray-500 mt-1">+5.2% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Bounce Rate  
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {emailKPIs.bounced > 0 ? ((emailKPIs.bounced / emailKPIs.totalSent) * 100).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: &lt;2%</p>
          </CardContent>
        </Card>
      </div>

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
