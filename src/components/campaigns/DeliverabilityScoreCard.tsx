import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Shield, 
  TrendingUp, 
  FileText, 
  Layout, 
  Users,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeliverabilityBreakdown {
  domainAuth: { score: number; max: 40; status: 'good' | 'warning' | 'error' };
  reputation: { score: number; max: 25; status: 'good' | 'warning' | 'error' };
  content: { score: number; max: 20; status: 'good' | 'warning' | 'error' };
  structure: { score: number; max: 10; status: 'good' | 'warning' | 'error' };
  recipient: { score: number; max: 5; status: 'good' | 'warning' | 'error' };
}

interface DeliverabilityScoreCardProps {
  percentage: number;
  breakdown: DeliverabilityBreakdown;
  recommendations: string[];
  isLoading?: boolean;
  compact?: boolean;
  showDetails?: boolean;
}

const FACTOR_CONFIG = [
  { 
    key: 'domainAuth' as const, 
    label: 'Domain Authentication', 
    weight: '40%',
    icon: Shield,
    helpText: 'SPF, DKIM, DMARC records',
    fixUrl: 'https://app.sendgrid.com/settings/sender_auth',
  },
  { 
    key: 'reputation' as const, 
    label: 'Sender Reputation', 
    weight: '25%',
    icon: TrendingUp,
    helpText: 'Based on domain age & sending history',
  },
  { 
    key: 'content' as const, 
    label: 'Email Content', 
    weight: '20%',
    icon: FileText,
    helpText: 'Spam words & triggers',
  },
  { 
    key: 'structure' as const, 
    label: 'Email Structure', 
    weight: '10%',
    icon: Layout,
    helpText: 'Subject, links, personalization',
  },
  { 
    key: 'recipient' as const, 
    label: 'Recipient Factors', 
    weight: '5%',
    icon: Users,
    helpText: 'Email provider strictness',
  },
];

const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'error' }) => {
  if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
};

export const DeliverabilityScoreCard = ({
  percentage,
  breakdown,
  recommendations,
  isLoading = false,
  compact = false,
  showDetails = true,
}: DeliverabilityScoreCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = () => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreLabel = () => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    if (percentage >= 30) return 'Poor';
    return 'Critical';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking deliverability...</span>
      </div>
    );
  }

  // Compact version for inline display
  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className={cn("font-semibold", getScoreColor())}>
              {percentage}%
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                percentage >= 70 ? 'border-green-200 bg-green-50 text-green-700' :
                percentage >= 50 ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-red-200 bg-red-50 text-red-700'
              )}
            >
              {getScoreLabel()}
            </Badge>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="space-y-2 text-sm">
            {FACTOR_CONFIG.map(factor => {
              const data = breakdown[factor.key];
              return (
                <div key={factor.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={data.status} />
                    <span className="text-muted-foreground">{factor.label}</span>
                  </div>
                  <span className="font-medium">{data.score}/{data.max}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Full card version
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header with score */}
      <div className={cn(
        "p-4 border-b border-border",
        percentage >= 70 ? 'bg-green-50 dark:bg-green-950/30' :
        percentage >= 50 ? 'bg-amber-50 dark:bg-amber-950/30' :
        'bg-red-50 dark:bg-red-950/30'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">Deliverability Score</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              percentage >= 70 ? 'border-green-300 bg-green-100 text-green-800' :
              percentage >= 50 ? 'border-amber-300 bg-amber-100 text-amber-800' :
              'border-red-300 bg-red-100 text-red-800'
            )}
          >
            {getScoreLabel()}
          </Badge>
        </div>
        
        <div className="flex items-end gap-3 mb-2">
          <span className={cn("text-4xl font-bold", getScoreColor())}>
            {percentage}
          </span>
          <span className="text-muted-foreground mb-1">/100</span>
        </div>
        
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500 rounded-full", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      {showDetails && (
        <div className="p-4 space-y-3">
          {FACTOR_CONFIG.map(factor => {
            const data = breakdown[factor.key];
            const Icon = factor.icon;
            const scorePercentage = (data.score / data.max) * 100;

            return (
              <div key={factor.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{factor.label}</span>
                    <span className="text-xs text-muted-foreground">({factor.weight})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={data.status} />
                    <span className="text-sm font-semibold">{data.score}/{data.max}</span>
                  </div>
                </div>
                <Progress value={scorePercentage} className="h-1.5" />
                {data.status !== 'good' && factor.fixUrl && (
                  <a 
                    href={factor.fixUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Fix this <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="px-4 pb-4">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
                <span className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  {recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <ul className="space-y-1.5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};
