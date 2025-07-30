import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Edit, Copy, Trash2, MessageSquare } from "lucide-react";
import { useSMSCampaigns, useSendSMSCampaign } from "@/hooks/useSMSCampaigns";
import { useSMSContacts } from "@/hooks/useSMSContacts";
import { SMSCampaignDialog } from "./SMSCampaignDialog";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'sending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const SMSCampaigns = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  const { data: campaigns, isLoading } = useSMSCampaigns();
  const { data: contacts } = useSMSContacts();
  const sendCampaign = useSendSMSCampaign();

  const handleSendCampaign = async (campaignId: string) => {
    if (!contacts || contacts.length === 0) {
      alert("No SMS contacts available. Please add contacts first.");
      return;
    }

    const phoneNumbers = contacts
      .filter(contact => contact.opted_in)
      .map(contact => contact.phone_number);

    if (phoneNumbers.length === 0) {
      alert("No opted-in contacts available.");
      return;
    }

    await sendCampaign.mutateAsync({ campaignId, phoneNumbers });
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCampaign(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading SMS campaigns...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SMS Campaigns</h2>
          <p className="text-muted-foreground">
            Create and manage your SMS marketing campaigns
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts?.filter(c => c.opted_in).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
                const totalFailed = campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0;
                const total = totalSent + totalFailed;
                return total > 0 ? Math.round((totalSent / total) * 100) : 0;
              })()}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
          <CardDescription>
            Get started quickly with pre-built SMS campaign templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader>
                <CardTitle className="text-lg">Promotional SMS</CardTitle>
                <CardDescription>
                  Announce special offers and promotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Reminder</CardTitle>
                <CardDescription>
                  Remind clients about upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50" onClick={handleCreateNew}>
              <CardHeader>
                <CardTitle className="text-lg">Follow-up Message</CardTitle>
                <CardDescription>
                  Follow up with clients after service completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No SMS campaigns</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first SMS campaign.
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Sent/Failed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {campaign.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.recipient_count}</TableCell>
                    <TableCell>
                      {campaign.sent_count}/{campaign.failed_count}
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {campaign.status === 'draft' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendCampaign(campaign.id)}
                              disabled={sendCampaign.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SMSCampaignDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        campaign={editingCampaign}
      />
    </div>
  );
};