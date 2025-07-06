
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface EmailCampaignsTabProps {
  campaigns: any[];
  onCreateCampaign: () => void;
  onEditCampaign: (campaign: any) => void;
  isCreating: boolean;
}

export const EmailCampaignsTab = ({ 
  campaigns, 
  onCreateCampaign, 
  onEditCampaign, 
  isCreating 
}: EmailCampaignsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Campaigns</h3>
        <Button 
          onClick={onCreateCampaign} 
          className="flex items-center gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>
      
      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEditCampaign(campaign)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">{campaign.subject}</p>
                    <p className="text-xs text-gray-500">Recipients: {campaign.recipient_count}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {campaign.status}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No Campaigns Yet</h4>
              <p className="text-sm mb-4">Create professional email campaigns with advanced tracking</p>
              <Button onClick={onCreateCampaign}>Create Your First Campaign</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
