
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Eye, Edit, Copy, Trash2, Calendar, Users } from "lucide-react";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { format } from "date-fns";

export const EmailCampaigns = () => {
  const { data: campaigns = [], isLoading, error } = useEmailCampaigns();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "completed":
        return "bg-accent/10 text-accent";
      case "sending":
        return "bg-primary/10 text-primary";
      case "scheduled":
        return "bg-secondary/10 text-secondary";
      case "paused":
        return "bg-muted/30 text-muted-foreground";
      case "draft":
        return "bg-muted/30 text-muted-foreground";
      default:
        return "bg-muted/30 text-muted-foreground";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div className="text-lg text-muted-foreground">Loading campaigns...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Send className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-destructive mb-2">Error Loading Campaigns</h3>
          <p className="text-muted-foreground max-w-md">
            Unable to load your email campaigns. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage bulk email campaigns
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Campaign Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Newsletter</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Send updates and news to all your clients
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-accent" />
                <h3 className="font-medium">Follow-up</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Follow up on quotes and project updates
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Promotion</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Promote special offers and services
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!campaigns || campaigns.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Send className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first email campaign to get started. Use one of the templates above or create a custom campaign.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Campaign Name</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Recipients</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium text-foreground">{campaign?.name || 'Untitled Campaign'}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{campaign?.subject || 'No subject'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign?.status || 'draft')} border-0`} variant="secondary">
                        {campaign?.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{campaign?.recipient_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {campaign?.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View campaign">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign?.status === 'draft' && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit campaign">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Duplicate campaign">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" title="Delete campaign">
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
