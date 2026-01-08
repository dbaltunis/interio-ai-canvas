import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SpamCheckResult {
  score: number;
  issues: string[];
  suggestions: string[];
}

interface EmailSpamScoreProps {
  result: SpamCheckResult | null;
  isLoading: boolean;
  onCheck: () => void;
}

export const EmailSpamScore = ({ result, isLoading, onCheck }: EmailSpamScoreProps) => {
  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-1.5 px-2 py-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking...
      </Badge>
    );
  }

  if (!result) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCheck}
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="h-3 w-3" />
        Check Score
      </Button>
    );
  }

  const { score, issues, suggestions } = result;
  
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let Icon = CheckCircle;
  let label = 'Low Risk';
  let colorClass = 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
  
  if (score > 60) {
    variant = 'destructive';
    Icon = XCircle;
    label = 'High Risk';
    colorClass = 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
  } else if (score > 30) {
    variant = 'outline';
    Icon = AlertTriangle;
    label = 'Medium Risk';
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
  }

  const hasIssues = issues.length > 0 || suggestions.length > 0;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`gap-1.5 px-2 py-1 cursor-help ${colorClass}`}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium">{score}</span>
              <span className="text-xs opacity-80">· {label}</span>
            </Badge>
          </TooltipTrigger>
          {hasIssues && (
            <TooltipContent side="bottom" className="max-w-[300px] p-3">
              {issues.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium text-xs mb-1">Issues Found:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-3 space-y-0.5">
                    {issues.slice(0, 3).map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions.length > 0 && (
                <div>
                  <p className="font-medium text-xs mb-1">Suggestions:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-3 space-y-0.5">
                    {suggestions.slice(0, 2).map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCheck}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};
