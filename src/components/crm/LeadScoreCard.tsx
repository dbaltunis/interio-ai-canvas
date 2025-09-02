import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LeadScoreCardProps {
  score: number;
  previousScore?: number;
  priority?: string;
  className?: string;
}

export const LeadScoreCard = ({ score, previousScore, priority, className }: LeadScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Hot Lead";
    if (score >= 60) return "Warm Lead";
    if (score >= 40) return "Cool Lead";
    return "Cold Lead";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return "bg-red-500 text-white";
      case 'high': return "bg-orange-500 text-white";
      case 'medium': return "bg-yellow-500 text-white";
      case 'low': return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTrend = () => {
    if (!previousScore || previousScore === score) return null;
    if (score > previousScore) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (score < previousScore) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <Card className={`border ${getScoreColor(score)} ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{score}</div>
            {getTrend()}
          </div>
          <div className="text-right">
            <div className="text-xs font-medium">{getScoreLabel(score)}</div>
            {priority && (
              <Badge className={`text-xs mt-1 ${getPriorityColor(priority)}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};