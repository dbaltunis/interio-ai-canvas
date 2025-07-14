
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Search, Filter } from "lucide-react";
import { usePricingRules, PricingRule } from "@/hooks/usePricingRules";
import { useToast } from "@/hooks/use-toast";
import { PricingRuleCard } from "./PricingRuleCard";
import { AddRuleDialog } from "./AddRuleDialog";

export const PricingRulesSection = () => {
  const { data: pricingRules, isLoading, createPricingRule, updatePricingRule, deletePricingRule } = usePricingRules();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Debug logging
  console.log("PricingRulesSection - Data:", pricingRules);
  console.log("PricingRulesSection - Loading:", isLoading);
  console.log("PricingRulesSection - Search term:", searchTerm);
  console.log("PricingRulesSection - Filter category:", filterCategory);

  const handleAddRule = async (newRule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    console.log("Adding new rule:", newRule);
    try {
      await createPricingRule.mutateAsync(newRule);
      console.log("Rule created successfully");
      toast({
        title: "Success",
        description: "Pricing rule created successfully"
      });
    } catch (error) {
      console.error("Failed to create pricing rule:", error);
      toast({
        title: "Error",
        description: "Failed to create pricing rule",
        variant: "destructive"
      });
    }
  };

  const handleToggleRule = async (ruleId: string, active: boolean) => {
    console.log("Toggling rule:", ruleId, "to:", active);
    try {
      await updatePricingRule.mutateAsync({ id: ruleId, active });
      toast({
        title: "Success",
        description: `Pricing rule ${active ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error("Failed to update pricing rule:", error);
      toast({
        title: "Error",
        description: "Failed to update pricing rule",
        variant: "destructive"
      });
    }
  };

  const handleEditRule = (rule: PricingRule) => {
    console.log("Edit rule clicked:", rule);
    toast({
      title: "Edit Rule",
      description: "Edit functionality coming soon"
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    console.log("Delete rule clicked:", ruleId);
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    try {
      await deletePricingRule.mutateAsync(ruleId);
      toast({
        title: "Success",
        description: "Pricing rule deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete pricing rule:", error);
      toast({
        title: "Error",
        description: "Failed to delete pricing rule",
        variant: "destructive"
      });
    }
  };

  // Filter and search rules
  const filteredRules = pricingRules?.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (rule.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || rule.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  console.log("Filtered rules:", filteredRules);

  // Group rules by category
  const rulesByCategory = filteredRules.reduce((acc, rule) => {
    const category = rule.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, PricingRule[]>);

  console.log("Rules by category:", rulesByCategory);

  // Get unique categories for filter
  const categories = Array.from(new Set(pricingRules?.map(rule => rule.category || 'General') || []));
  console.log("Available categories:", categories);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
              Pricing Rules Management
            </CardTitle>
            <CardDescription>
              Configure automatic pricing calculations and markups for different window covering categories
            </CardDescription>
          </div>
          <AddRuleDialog onAdd={handleAddRule} isLoading={createPricingRule.isPending} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Debug Info */}
        <div className="bg-gray-100 p-4 rounded text-sm">
          <strong>Debug Info:</strong><br/>
          Total Rules: {pricingRules?.length || 0}<br/>
          Loading: {isLoading ? 'Yes' : 'No'}<br/>
          Filtered Rules: {filteredRules.length}<br/>
          Categories: {categories.join(', ') || 'None'}
        </div>

        {/* Search and Filter Controls */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rules by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-brand-neutral">
            Loading pricing rules...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-8 text-brand-neutral">
            {searchTerm || filterCategory !== "all" 
              ? "No rules match your search criteria." 
              : "No pricing rules configured yet. Create your first rule above."
            }
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(rulesByCategory).map(([category, rules]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-primary">{category}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {rules.length} rule{rules.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {rules
                    .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Sort by priority
                    .map((rule) => (
                      <PricingRuleCard
                        key={rule.id}
                        rule={rule}
                        onToggle={handleToggleRule}
                        onEdit={handleEditRule}
                        onDelete={handleDeleteRule}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
