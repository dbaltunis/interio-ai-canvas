
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Mail, 
  Users, 
  FileText, 
  Plus, 
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import { EmailKPIsDashboard } from "./email-components/EmailKPIsDashboard";
import { useEmailKPIs } from "@/hooks/useEmails";

export const EmailsTab = () => {
  const [activeEmailTab, setActiveEmailTab] = useState<"overview" | "campaigns" | "templates" | "analytics">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get email KPIs data with proper error handling
  const { data: emailKPIs, isLoading: emailKPIsLoading, error: emailKPIsError } = useEmailKPIs();

  // Mock data for campaigns and templates (replace with real data later)
  const emailCampaigns = [
    {
      id: '1',
      name: 'Spring Collection Launch',
      subject: 'New Spring Window Treatments Available',
      status: 'sent' as const,
      sent_count: 150,
      open_rate: 45,
      click_rate: 12,
      created_at: '2024-01-15',
      scheduled_at: '2024-01-16'
    },
    {
      id: '2',
      name: 'Customer Follow-up',
      subject: 'How did we do? Your feedback matters',
      status: 'draft' as const,
      sent_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_at: '2024-01-20',
      scheduled_at: null
    },
    {
      id: '3',
      name: 'Holiday Promotion',
      subject: '25% Off All Custom Blinds',
      status: 'scheduled' as const,
      sent_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_at: '2024-01-18',
      scheduled_at: '2024-01-25'
    }
  ];

  const emailTemplates = [
    {
      id: '1',
      name: 'Quote Follow-up',
      subject: 'Following up on your window treatment quote',
      usage_count: 25,
      last_used: '2024-01-20'
    },
    {
      id: '2',
      name: 'Installation Reminder',
      subject: 'Your installation is scheduled for tomorrow',
      usage_count: 18,
      last_used: '2024-01-19'
    },
    {
      id: '3',
      name: 'Thank You',
      subject: 'Thank you for choosing our services',
      usage_count: 32,
      last_used: '2024-01-21'
    }
  ];

  // Prepare KPIs data for the dashboard component with proper error handling
  const kpisData = emailKPIs ? {
    total_sent: emailKPIs.totalSent || 0,
    total_delivered: emailKPIs.totalDelivered || emailKPIs.delivered || 0,
    total_opened: emailKPIs.totalOpened || 0,
    total_clicked: emailKPIs.totalClicked || 0,
    open_rate: emailKPIs.openRate || 0,
    click_rate: emailKPIs.clickRate || 0,
    bounce_rate: emailKPIs.bounced ? Math.round((emailKPIs.bounced / (emailKPIs.totalSent || 1)) * 100) : 0,
    avg_time_spent: 150, // Average time in seconds
    issues_count: emailKPIs.bounced || 0
  } : {
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    open_rate: 0,
    click_rate: 0,
    bounce_rate: 0,
    avg_time_spent: 0,
    issues_count: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show error state if there's an error
  if (emailKPIsError) {
    console.error("Error loading email KPIs:", emailKPIsError);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary">Email Management</h2>
            <p className="text-brand-neutral">Manage campaigns, templates, and track email performance</p>
          </div>
        </div>
        
        <Card className="p-6">
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email System Unavailable</h3>
            <p className="text-gray-600">
              The email system is currently being set up. Please check back later.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-primary">Email Management</h2>
          <p className="text-brand-neutral">Manage campaigns, templates, and track email performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-brand-primary hover:bg-brand-accent flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Email KPIs Dashboard */}
      {emailKPIsLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading email analytics...</p>
          </div>
        </div>
      ) : (
        <EmailKPIsDashboard kpis={kpisData} />
      )}

      {/* Tabs */}
      <Tabs value={activeEmailTab} onValueChange={(value) => setActiveEmailTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailCampaigns.length}</div>
                <p className="text-xs text-muted-foreground">Active campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailTemplates.length}</div>
                <p className="text-xs text-muted-foreground">Email templates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpisData.open_rate}%</div>
                <p className="text-xs text-muted-foreground">Across all campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-sm font-medium">Last Campaign</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2d</div>
                <p className="text-xs text-muted-foreground">Days ago</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest email campaign activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailCampaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-gray-600">{campaign.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {campaign.sent_count > 0 ? `${campaign.sent_count} sent` : 'Not sent'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {emailCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{campaign.subject}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Created: {campaign.created_at}</span>
                        {campaign.scheduled_at && (
                          <span>Scheduled: {campaign.scheduled_at}</span>
                        )}
                        {campaign.sent_count > 0 && (
                          <>
                            <span>Sent: {campaign.sent_count}</span>
                            <span>Open Rate: {campaign.open_rate}%</span>
                            <span>Click Rate: {campaign.click_rate}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Duplicate
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button size="sm" className="bg-brand-primary hover:bg-brand-accent">
                          Send
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-gray-600 mb-2">{template.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Used {template.usage_count} times</span>
                        <span>Last used: {template.last_used}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Detailed email performance analytics and insights will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
