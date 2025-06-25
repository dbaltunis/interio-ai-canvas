
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Mail, 
  Users, 
  BarChart3, 
  Eye, 
  Clock, 
  MousePointer, 
  TrendingUp,
  Plus,
  FileText,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EmailsTab = () => {
  const [emails, setEmails] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSent: 1250,
    openRate: 68.5,
    clickRate: 12.3,
    avgTimeSpent: "2m 34s",
    delivered: 1205,
    bounced: 45
  });
  const { toast } = useToast();

  // Mock data for demonstration
  const recentEmails = [
    {
      id: 1,
      subject: "Quote Follow-up - Living Room Curtains",
      recipient: "sarah.johnson@email.com",
      status: "delivered",
      opens: 3,
      timeSpent: "1m 45s",
      sentAt: "2025-01-15 09:30"
    },
    {
      id: 2,
      subject: "Installation Reminder - Kitchen Blinds",
      recipient: "mike.chen@email.com",
      status: "opened",
      opens: 1,
      timeSpent: "45s",
      sentAt: "2025-01-15 08:15"
    },
    {
      id: 3,
      subject: "New Collection Launch - Spring 2025",
      recipient: "campaign@bulk.send",
      status: "campaign",
      opens: 156,
      timeSpent: "3m 12s",
      sentAt: "2025-01-14 16:00"
    }
  ];

  const handleSendEmail = () => {
    toast({
      title: "Email Sent",
      description: "Your email has been sent successfully.",
    });
  };

  const handleCreateCampaign = () => {
    toast({
      title: "Campaign Created",
      description: "Your email campaign has been created and scheduled.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Sent</p>
                <p className="text-lg font-bold">{analytics.totalSent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Open Rate</p>
                <p className="text-lg font-bold">{analytics.openRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Click Rate</p>
                <p className="text-lg font-bold">{analytics.clickRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Time</p>
                <p className="text-lg font-bold">{analytics.avgTimeSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Delivered</p>
                <p className="text-lg font-bold">{analytics.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Bounced</p>
                <p className="text-lg font-bold">{analytics.bounced}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Email Interface */}
      <Tabs defaultValue="compose" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Compose Email Tab */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Send individual emails or schedule campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input placeholder="recipient@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Select template...</option>
                    <option value="quote_followup">Quote Follow-up</option>
                    <option value="installation_reminder">Installation Reminder</option>
                    <option value="thank_you">Thank You</option>
                    <option value="promotion">Promotional</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Email subject..." />
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Write your email message here..." 
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Send
                </Button>
                <Button onClick={handleSendEmail} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Campaigns</h3>
              <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No Campaigns Yet</h4>
                  <p className="text-sm mb-4">Create your first email campaign to reach multiple clients</p>
                  <Button onClick={handleCreateCampaign}>Create Campaign</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Templates</h3>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Quote Follow-up', 'Installation Reminder', 'Thank You', 'Promotional', 'Quote Ready', 'Payment Reminder'].map((template) => (
                <Card key={template} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template}</h4>
                        <p className="text-sm text-gray-600">Last used 2 days ago</p>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Performance Analytics</CardTitle>
                <CardDescription>Detailed insights into your email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">Analytics Dashboard</h4>
                  <p className="text-sm">Detailed analytics will be available once SendGrid integration is complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>Track all sent emails and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opens</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.subject}</TableCell>
                      <TableCell>{email.recipient}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            email.status === 'delivered' ? 'default' : 
                            email.status === 'opened' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{email.opens}</TableCell>
                      <TableCell>{email.timeSpent}</TableCell>
                      <TableCell>{email.sentAt}</TableCell>
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
