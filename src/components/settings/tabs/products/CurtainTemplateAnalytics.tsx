import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const CurtainTemplateAnalytics = () => {
  const { data: templates = [] } = useCurtainTemplates();

  // Analytics calculations
  const totalTemplates = templates.length;
  const headingTypes = templates.reduce((acc, template) => {
    const type = template.heading_name || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pricingTypes = templates.reduce((acc, template) => {
    const type = template.pricing_type.replace('_', ' ');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const railroadableCount = templates.filter(t => t.is_railroadable).length;
  const manufacturingTypes = templates.reduce((acc, template) => {
    const type = template.manufacturing_type || 'machine';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const headingChartData = Object.entries(headingTypes).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalTemplates) * 100)
  }));

  const pricingChartData = Object.entries(pricingTypes).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Heading Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(headingTypes).length}</div>
            <p className="text-xs text-muted-foreground">Unique styles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Railroadable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{railroadableCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalTemplates > 0 ? Math.round((railroadableCount / totalTemplates) * 100) : 0}% of templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Waste %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length > 0 
                ? Math.round(templates.reduce((sum, t) => sum + (t.waste_percent || 0), 0) / templates.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average waste allowance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Heading Types Distribution</CardTitle>
            <CardDescription>Breakdown of template heading styles</CardDescription>
          </CardHeader>
          <CardContent>
            {headingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={headingChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {headingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Methods</CardTitle>
            <CardDescription>How templates are priced</CardDescription>
          </CardHeader>
          <CardContent>
            {pricingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pricingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manufacturing Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Manufacturing Configuration Summary</CardTitle>
          <CardDescription>Overview of manufacturing settings across templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(manufacturingTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{type}</Badge>
                  <span className="text-sm">{count} templates</span>
                </div>
                <Progress 
                  value={(count / totalTemplates) * 100} 
                  className="w-32" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Template Quality Metrics</CardTitle>
          <CardDescription>Completeness and configuration quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {templates.filter(t => t.lining_types?.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">With Linings</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {templates.filter(t => t.pricing_type === 'pricing_grid').length}
              </div>
              <p className="text-sm text-muted-foreground">Grid Pricing</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {templates.filter(t => t.fullness_ratio >= 2.5).length}
              </div>
              <p className="text-sm text-muted-foreground">High Fullness</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {templates.filter(t => t.description && t.description.length > 10).length}
              </div>
              <p className="text-sm text-muted-foreground">Well Documented</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};