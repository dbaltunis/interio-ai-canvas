import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { useAllClientStages, useCreateClientStage } from "@/hooks/useClientStages";
import { useState } from "react";

const DEFAULT_STAGES = [
  { slot_number: 1, name: "lead", label: "Lead", color: "gray", description: "New potential customer" },
  { slot_number: 2, name: "contacted", label: "Contacted", color: "blue", description: "Initial contact made" },
  { slot_number: 3, name: "qualified", label: "Qualified", color: "yellow", description: "Confirmed interest and budget" },
  { slot_number: 4, name: "quoted", label: "Quoted", color: "purple", description: "Quote/proposal sent" },
  { slot_number: 5, name: "negotiation", label: "Negotiation", color: "orange", description: "Discussing terms" },
  { slot_number: 6, name: "approved", label: "Approved", color: "green", description: "Deal approved" },
  { slot_number: 7, name: "trial", label: "Trial", color: "blue", description: "Trial period active" },
  { slot_number: 8, name: "customer", label: "Customer", color: "green", description: "Active customer", is_default: true },
  { slot_number: 9, name: "churned", label: "Churned", color: "red", description: "Lost or cancelled" },
  { slot_number: 10, name: "vip", label: "VIP", color: "primary", description: "Premium segment" },
];

const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    primary: "bg-primary/10 text-primary",
  };
  return colorMap[color] || colorMap.gray;
};

export const SeedClientStages = () => {
  const { data: stages = [], isLoading } = useAllClientStages();
  const createStage = useCreateClientStage();
  const [isSeeding, setIsSeeding] = useState(false);

  const activeCount = stages.filter(s => s.is_active !== false).length;

  const handleSeedStages = async () => {
    setIsSeeding(true);
    try {
      for (const stage of DEFAULT_STAGES) {
        const existing = stages.find(s => s.slot_number === stage.slot_number);
        if (!existing) {
          await createStage.mutateAsync({
            ...stage,
            is_active: true,
            is_default: stage.is_default || false,
          });
        }
      }
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) return null;

  // Don't show if user already has stages configured
  if (activeCount >= 3) return null;

  return (
    <Card className="border-dashed border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Set Up Client Funnel Stages
        </CardTitle>
        <CardDescription>
          You haven't configured client stages yet. Use our recommended template to get started quickly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {DEFAULT_STAGES.map((stage) => (
            <Badge
              key={stage.slot_number}
              className={`${getColorClasses(stage.color)} border-0`}
              variant="secondary"
            >
              {stage.label}
            </Badge>
          ))}
        </div>
        <Button
          onClick={handleSeedStages}
          disabled={isSeeding}
          className="w-full sm:w-auto"
        >
          <Users className="h-4 w-4 mr-2" />
          {isSeeding ? "Creating stages..." : "Use Recommended Template"}
        </Button>
      </CardContent>
    </Card>
  );
};
