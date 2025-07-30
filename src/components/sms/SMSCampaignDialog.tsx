import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users } from "lucide-react";
import { useCreateSMSCampaign, useUpdateSMSCampaign } from "@/hooks/useSMSCampaigns";
import { useSMSContacts } from "@/hooks/useSMSContacts";

interface SMSCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
}

export const SMSCampaignDialog = ({ open, onOpenChange, campaign }: SMSCampaignDialogProps) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  
  const { data: contacts } = useSMSContacts();
  const createCampaign = useCreateSMSCampaign();
  const updateCampaign = useUpdateSMSCampaign();

  const isEditing = !!campaign;
  const activeContacts = contacts?.filter(c => c.opted_in) || [];

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setMessage(campaign.message);
    } else {
      setName("");
      setMessage("");
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const campaignData = {
      name,
      message,
      status: 'draft',
      recipient_count: activeContacts.length,
      sent_count: 0,
      failed_count: 0,
    };

    try {
      if (isEditing) {
        await updateCampaign.mutateAsync({
          id: campaign.id,
          updates: campaignData,
        });
      } else {
        await createCampaign.mutateAsync(campaignData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const characterCount = message.length;
  const smsSegments = Math.ceil(characterCount / 160);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit SMS Campaign' : 'Create SMS Campaign'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter campaign name..."
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your SMS message here..."
                rows={4}
                required
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{characterCount} characters</span>
                <span>{smsSegments} SMS segment{smsSegments !== 1 ? 's' : ''}</span>
              </div>
              {characterCount > 160 && (
                <p className="text-sm text-yellow-600 mt-1">
                  Messages over 160 characters will be split into multiple SMS segments
                </p>
              )}
            </div>
          </div>

          {/* Campaign Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Message Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                  {message || "Your message will appear here..."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Recipients
              </CardTitle>
              <CardDescription>
                This campaign will be sent to all opted-in SMS contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{activeContacts.length} contacts</p>
                  <p className="text-sm text-gray-500">
                    Opted-in contacts will receive this message
                  </p>
                </div>
                <Badge variant="outline">
                  {activeContacts.length} recipients
                </Badge>
              </div>
              
              {activeContacts.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    No active SMS contacts found. Add contacts first to send campaigns.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending || updateCampaign.isPending || !message.trim()}
            >
              {isEditing ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};