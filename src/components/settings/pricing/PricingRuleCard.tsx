
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Trash2, Edit3 } from "lucide-react";
import { PricingRule } from "@/hooks/usePricingRules";

interface PricingRuleCardProps {
  rule: PricingRule;
  onToggle: (id: string, active: boolean) => void;
  onEdit: (rule: PricingRule) => void;
  onDelete: (id: string) => void;
}

export const PricingRuleCard = ({ rule, onToggle, onEdit, onDelete }: PricingRuleCardProps) => {
  return (
    <Card className={`transition-all ${rule.active ? 'border-brand-primary/20 bg-brand-primary/5' : 'border-gray-200 bg-gray-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch 
              checked={rule.active} 
              onCheckedChange={(checked) => onToggle(rule.id, checked)}
            />
            <div>
              <CardTitle className="text-base font-semibold text-brand-primary">
                {rule.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {rule.category || 'General'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Priority: {rule.priority || 0}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-semibold text-brand-primary">
                {rule.rule_type === 'percentage' ? `${rule.value}%` : `$${rule.value}`}
              </div>
              <div className="text-xs text-brand-neutral">
                {rule.rule_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(rule)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(rule.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
        <CardContent className="pt-0">
          <div className="text-sm text-brand-neutral">
            <strong>Conditions:</strong> {JSON.stringify(rule.conditions, null, 2)}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
