import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, User, Building, Package, DollarSign, Calendar } from "lucide-react";

interface PlaceholderPanelProps {
  onInsertPlaceholder: (placeholder: string) => void;
}

const placeholderGroups = [
  {
    title: "Client Information",
    icon: User,
    color: "text-blue-500",
    items: [
      { token: "{{client.name}}", label: "Client Name" },
      { token: "{{client.email}}", label: "Client Email" },
      { token: "{{client.phone}}", label: "Client Phone" },
      { token: "{{client.address}}", label: "Client Address" },
      { token: "{{client.company}}", label: "Company Name" },
    ]
  },
  {
    title: "Quote Details",
    icon: FileText,
    color: "text-green-500",
    items: [
      { token: "{{quote.number}}", label: "Quote Number" },
      { token: "{{quote.date}}", label: "Quote Date" },
      { token: "{{quote.validUntil}}", label: "Valid Until" },
      { token: "{{quote.status}}", label: "Quote Status" },
    ]
  },
  {
    title: "Business Information",
    icon: Building,
    color: "text-purple-500",
    items: [
      { token: "{{business.name}}", label: "Business Name" },
      { token: "{{business.email}}", label: "Business Email" },
      { token: "{{business.phone}}", label: "Business Phone" },
      { token: "{{business.address}}", label: "Business Address" },
      { token: "{{business.abn}}", label: "ABN" },
    ]
  },
  {
    title: "Financial",
    icon: DollarSign,
    color: "text-orange-500",
    items: [
      { token: "{{quote.subtotal}}", label: "Subtotal" },
      { token: "{{quote.tax}}", label: "Tax Amount" },
      { token: "{{quote.total}}", label: "Total Amount" },
      { token: "{{quote.deposit}}", label: "Deposit Amount" },
    ]
  },
  {
    title: "Date & Time",
    icon: Calendar,
    color: "text-pink-500",
    items: [
      { token: "{{today}}", label: "Today's Date" },
      { token: "{{time}}", label: "Current Time" },
    ]
  },
];

export const PlaceholderPanel = ({ onInsertPlaceholder }: PlaceholderPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Dynamic Fields</h3>
        <p className="text-xs text-muted-foreground">
          Click to insert placeholders that will be replaced with real data when generating quotes
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-4 pr-4">
          {placeholderGroups.map((group, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-3">
                <group.icon className={`h-4 w-4 ${group.color}`} />
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.title}
                </Label>
              </div>
              
              <div className="space-y-2">
                {group.items.map((item, itemIdx) => (
                  <Button
                    key={itemIdx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-between h-auto py-2 px-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                    onClick={() => onInsertPlaceholder(item.token)}
                  >
                    <span className="text-xs font-medium">{item.label}</span>
                    <Badge variant="secondary" className="text-[10px] font-mono group-hover:bg-primary/10">
                      {item.token}
                    </Badge>
                  </Button>
                ))}
              </div>
              
              {idx < placeholderGroups.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
