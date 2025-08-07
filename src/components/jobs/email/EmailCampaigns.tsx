
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Send, Eye, Edit, Copy, Trash2, Calendar, Users } from "lucide-react";
import { useEmailCampaigns } from "@/hooks/useEmailCampaigns";
import { format } from "date-fns";

export const EmailCampaigns = () => {
  const { data: campaigns = [] } = useEmailCampaigns();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "completed":
        return "bg-green-100 text-green-800";
      case "sending":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
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
          <h2 className="text-xl font-semibold">Email Campaigns</h2>
          <p className="text-gray-600 text-sm mt-1">
            Create and manage bulk email campaigns
          </p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent text-white">
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
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Send className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Newsletter</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Send updates and news to all your clients
              </p>
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Follow-up</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Follow up on quotes and project updates
              </p>
              <Button variant="outline" size="sm">
                Use Template
              </Button>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Promotion</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Promote special offers and services
              </p>
              <Button variant="outline" size="sm">
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
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Send className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
              <p className="text-gray-500 mb-4">Create your first email campaign to get started.</p>
              <Button className="bg-brand-primary hover:bg-brand-accent text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
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
                  <TableRow key={campaign.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{campaign.subject}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(campaign.status)} border-0`} variant="secondary">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{campaign.recipient_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4" />
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
