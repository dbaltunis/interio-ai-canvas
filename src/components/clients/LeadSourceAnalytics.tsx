import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Target, Globe, Facebook, Search, UserPlus } from "lucide-react";

interface LeadSourceData {
  source: string;
  icon: any;
  count: number;
  value: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export const LeadSourceAnalytics = () => {
  const leadSources: LeadSourceData[] = [
    {
      source: 'Website',
      icon: Globe,
      count: 45,
      value: 125000,
      conversionRate: 23,
      trend: 'up',
      trendValue: 12
    },
    {
      source: 'Google Ads',
      icon: Search,
      count: 32,
      value: 89000,
      conversionRate: 18,
      trend: 'up',
      trendValue: 8
    },
    {
      source: 'Facebook Ads',
      icon: Facebook,
      count: 28,
      value: 67000,
      conversionRate: 15,
      trend: 'down',
      trendValue: -3
    },
    {
      source: 'Referral',
      icon: UserPlus,
      count: 22,
      value: 98000,
      conversionRate: 35,
      trend: 'up',
      trendValue: 5
    },
    {
      source: 'Trade Show',
      icon: Users,
      count: 15,
      value: 45000,
      conversionRate: 28,
      trend: 'stable',
      trendValue: 0
    }
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const totalLeads = leadSources.reduce((sum, source) => sum + source.count, 0);
  const totalValue = leadSources.reduce((sum, source) => sum + source.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-primary">{totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Conversion</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(leadSources.reduce((sum, s) => sum + s.conversionRate, 0) / leadSources.length)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Source</p>
                <p className="text-xl font-bold text-purple-600">Website</p>
                <p className="text-xs text-muted-foreground">45 leads</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Sources Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadSources.map((source) => {
              const percentage = (source.count / totalLeads) * 100;
              const Icon = source.icon;
              
              return (
                <div key={source.source} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{source.source}</h4>
                        <p className="text-sm text-muted-foreground">
                          {source.count} leads ({percentage.toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${source.value.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className={getTrendColor(source.trend)}>
                          {getTrendIcon(source.trend)} {Math.abs(source.trendValue)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className="ml-4 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {source.conversionRate}% conversion
                    </Badge>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leads</p>
                      <p className="font-semibold">{source.count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-semibold">${(source.value / 1000).toFixed(0)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg/Lead</p>
                      <p className="font-semibold">${Math.round(source.value / source.count).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};