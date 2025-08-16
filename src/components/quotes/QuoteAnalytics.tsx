import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { formatCurrency } from "@/utils/currency";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  Calendar,
  Target,
  Award,
  Clock,
  CheckCircle
} from "lucide-react";

interface QuoteAnalyticsProps {
  projectId?: string;
  clientId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export const QuoteAnalytics: React.FC<QuoteAnalyticsProps> = ({ 
  projectId, 
  clientId, 
  timeRange = 'month' 
}) => {
  const { data: quotes = [] } = useQuotes(projectId);
  const { data: clients = [] } = useClients();

  // Filter quotes by client if specified
  const filteredQuotes = clientId 
    ? quotes.filter(quote => quote.client_id === clientId)
    : quotes;

  // Calculate analytics
  const totalQuotes = filteredQuotes.length;
  const totalValue = filteredQuotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
  const averageQuoteValue = totalQuotes > 0 ? totalValue / totalQuotes : 0;

  // Status breakdown
  const statusCounts = filteredQuotes.reduce((acc, quote) => {
    const status = quote.status || 'draft';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const approvedQuotes = statusCounts.approved || 0;
  const sentQuotes = statusCounts.sent || 0;
  const draftQuotes = statusCounts.draft || 0;
  const rejectedQuotes = statusCounts.rejected || 0;

  const conversionRate = sentQuotes > 0 ? (approvedQuotes / sentQuotes) * 100 : 0;
  const approvalRate = totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0;

  // Revenue analytics
  const approvedValue = filteredQuotes
    .filter(quote => quote.status === 'approved')
    .reduce((sum, quote) => sum + (quote.total_amount || 0), 0);

  const pendingValue = filteredQuotes
    .filter(quote => quote.status === 'sent')
    .reduce((sum, quote) => sum + (quote.total_amount || 0), 0);

  // Time-based analytics (mock for now - would need better date filtering)
  const recentQuotes = filteredQuotes.filter(quote => {
    const quoteDate = new Date(quote.created_at);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1); // Last month
    return quoteDate >= cutoffDate;
  });

  const previousPeriodQuotes = filteredQuotes.filter(quote => {
    const quoteDate = new Date(quote.created_at);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - 1);
    return quoteDate >= startDate && quoteDate < endDate;
  });

  const quotesGrowth = previousPeriodQuotes.length > 0 
    ? ((recentQuotes.length - previousPeriodQuotes.length) / previousPeriodQuotes.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                <p className="text-3xl font-bold">{totalQuotes}</p>
                <div className="flex items-center mt-2">
                  {quotesGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${quotesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(quotesGrowth).toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">vs last period</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Avg: {formatCurrency(averageQuoteValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {approvedQuotes} of {sentQuotes} sent
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Value</p>
                <p className="text-3xl font-bold">{formatCurrency(approvedValue)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {approvedQuotes} quotes
                </p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quote Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{approvedQuotes}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalQuotes > 0 ? ((approvedQuotes / totalQuotes) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <Progress value={totalQuotes > 0 ? (approvedQuotes / totalQuotes) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Sent</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{sentQuotes}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalQuotes > 0 ? ((sentQuotes / totalQuotes) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <Progress value={totalQuotes > 0 ? (sentQuotes / totalQuotes) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm font-medium">Draft</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{draftQuotes}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalQuotes > 0 ? ((draftQuotes / totalQuotes) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <Progress value={totalQuotes > 0 ? (draftQuotes / totalQuotes) * 100 : 0} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{rejectedQuotes}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalQuotes > 0 ? ((rejectedQuotes / totalQuotes) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <Progress value={totalQuotes > 0 ? (rejectedQuotes / totalQuotes) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Approved Revenue</p>
                    <p className="text-sm text-muted-foreground">Confirmed sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(approvedValue)}</p>
                  <p className="text-sm text-muted-foreground">{approvedQuotes} quotes</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Pending Revenue</p>
                    <p className="text-sm text-muted-foreground">Awaiting approval</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(pendingValue)}</p>
                  <p className="text-sm text-muted-foreground">{sentQuotes} quotes</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Total Pipeline</p>
                  <p className="text-sm text-muted-foreground">Approved + Pending</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{formatCurrency(approvedValue + pendingValue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {approvedQuotes + sentQuotes} quotes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {formatCurrency(averageQuoteValue)}
              </div>
              <p className="text-sm text-muted-foreground">Average Quote Value</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {conversionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Sent → Approved Rate</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {approvalRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Approval Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};