import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rocket, RefreshCw, Heart, Megaphone } from "lucide-react";

interface CampaignTypeStepProps {
  type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  name: string;
  recipientCount: number;
  onUpdateType: (type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement') => void;
  onUpdateName: (name: string) => void;
}

const CAMPAIGN_TYPES = [
  {
    value: 'outreach' as const,
    label: 'New Lead Outreach',
    description: 'First contact with potential clients',
    icon: Rocket,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    value: 'follow-up' as const,
    label: 'Follow-up',
    description: 'Check in with existing contacts',
    icon: RefreshCw,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    value: 're-engagement' as const,
    label: 'Re-engagement',
    description: 'Win back inactive or churned contacts',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 border-pink-200',
  },
  {
    value: 'announcement' as const,
    label: 'Announcement',
    description: 'Share news, updates, or promotions',
    icon: Megaphone,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
  },
];

export const CampaignTypeStep = ({
  type,
  name,
  recipientCount,
  onUpdateType,
  onUpdateName,
}: CampaignTypeStepProps) => {
  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name</Label>
        <Input
          id="campaign-name"
          placeholder="e.g., Q4 Outreach Campaign"
          value={name}
          onChange={(e) => onUpdateName(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Internal name for your reference
        </p>
      </div>

      {/* Campaign Type */}
      <div className="space-y-3">
        <Label>Campaign Type</Label>
        <p className="text-sm text-muted-foreground">
          Choose the type that best matches your goal for {recipientCount} recipients
        </p>

        <RadioGroup
          value={type}
          onValueChange={(value) => onUpdateType(value as typeof type)}
          className="grid grid-cols-2 gap-3"
        >
          {CAMPAIGN_TYPES.map((campaignType) => {
            const Icon = campaignType.icon;
            const isSelected = type === campaignType.value;
            
            return (
              <label
                key={campaignType.value}
                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${campaignType.bgColor} border-current`
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <RadioGroupItem
                  value={campaignType.value}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${isSelected ? campaignType.bgColor : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? campaignType.color : 'text-muted-foreground'}`} />
                  </div>
                  <div className="space-y-1">
                    <div className={`font-medium ${isSelected ? 'text-foreground' : ''}`}>
                      {campaignType.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaignType.description}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};
