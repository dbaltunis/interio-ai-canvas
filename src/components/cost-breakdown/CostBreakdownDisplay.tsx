import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/utils/unitConversion";

interface CostBreakdownItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  total_cost: number;
  category: 'fabric' | 'lining' | 'manufacturing' | 'heading' | 'extras';
  details?: any;
}

interface CostBreakdownDisplayProps {
  breakdown: CostBreakdownItem[];
  currency?: string;
  totalCost: number;
  showDetails?: boolean;
}

export function CostBreakdownDisplay({ 
  breakdown, 
  currency = 'GBP', 
  totalCost, 
  showDetails = false 
}: CostBreakdownDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'fabric': return 'default';
      case 'lining': return 'secondary';
      case 'manufacturing': return 'outline';
      case 'heading': return 'destructive';
      case 'extras': return 'outline';
      default: return 'outline';
    }
  };

  const groupedBreakdown = breakdown.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CostBreakdownItem[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalCost, currency)}</div>
            <div className="text-sm text-muted-foreground">{breakdown.length} items</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left mb-4 hover:text-primary transition-colors">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Detailed Breakdown</span>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            {Object.entries(groupedBreakdown).map(([category, items]) => (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getCategoryBadgeVariant(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  <span className="font-medium">
                    {formatCurrency(items.reduce((sum, item) => sum + item.total_cost, 0), currency)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        )}
                        {item.quantity && item.unit && item.unit_price && (
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit} × {formatCurrency(item.unit_price, currency)}
                          </div>
                        )}
                        {item.details && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {typeof item.details === 'string' 
                              ? item.details 
                              : JSON.stringify(item.details).slice(0, 100)
                            }
                          </div>
                        )}
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency(item.total_cost, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
        
        {!isExpanded && (
          <div className="space-y-2">
            {Object.entries(groupedBreakdown).map(([category, items]) => (
              <div key={category} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <Badge variant={getCategoryBadgeVariant(category)} className="text-xs">
                    {category}
                  </Badge>
                  <span className="text-sm">{items.length} item(s)</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(items.reduce((sum, item) => sum + item.total_cost, 0), currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}