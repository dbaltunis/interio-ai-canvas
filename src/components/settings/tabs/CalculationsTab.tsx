
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calculator, Plus, Edit, Settings, Trash2, Info, Layers, Ruler } from "lucide-react";
import { useState } from "react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export const CalculationsTab = () => {
  const { getLengthUnitLabel } = useMeasurementUnits();
  const lengthUnit = getLengthUnitLabel();
  const { toast } = useToast();
  
  // Form state for calculation settings
  const [settings, setSettings] = useState({
    headerHem: "15.0",
    bottomHem: "10.0", 
    sideHem: "5.0",
    seamAllowance: "1.5",
    fabricWastage: "5.0",
    patternRepeat: "0.0",
    rounding: "round_up_5",
    defaultMarkup: "40.0",
    taxRate: "10.0"
  });

  // Height-based pricing tiers
  const [heightTiers, setHeightTiers] = useState([
    {
      id: 1,
      name: "Standard Height",
      minHeight: "0",
      maxHeight: "240",
      basePriceMultiplier: "1.0",
      additionalLaborHours: "0",
      description: "Standard curtains up to 2.4m drop"
    },
    {
      id: 2,
      name: "Extra Height",
      minHeight: "240",
      maxHeight: "300",
      basePriceMultiplier: "1.25",
      additionalLaborHours: "0.5",
      description: "Tall curtains 2.4m to 3.0m drop - requires careful handling"
    },
    {
      id: 3,
      name: "Super Height",
      minHeight: "300",
      maxHeight: "400",
      basePriceMultiplier: "1.6",
      additionalLaborHours: "1.0",
      description: "Very tall curtains 3.0m+ - complex installation, extra fabric joins"
    }
  ]);

  // Lining and construction options
  const [constructionOptions, setConstructionOptions] = useState([
    {
      id: 1,
      name: "Unlined",
      priceMultiplier: "1.0",
      additionalLaborHours: "0",
      description: "Basic curtain with no lining"
    },
    {
      id: 2,
      name: "Standard Lined",
      priceMultiplier: "1.4",
      additionalLaborHours: "0.75",
      description: "Curtain with cotton sateen lining - sewn in"
    },
    {
      id: 3,
      name: "Detachable Lined",
      priceMultiplier: "1.6",
      additionalLaborHours: "1.0",
      description: "Curtain with detachable lining using hooks/loops"
    },
    {
      id: 4,
      name: "Interlined",
      priceMultiplier: "1.8",
      additionalLaborHours: "1.5",
      description: "Curtain with interlining (bump/domette) for insulation and body"
    },
    {
      id: 5,
      name: "Lined & Interlined",
      priceMultiplier: "2.2",
      additionalLaborHours: "2.0",
      description: "Premium construction with both lining and interlining"
    }
  ]);

  // Seaming and joining complexity
  const [seamingOptions, setSeamingOptions] = useState([
    {
      id: 1,
      name: "No Seams Required",
      priceMultiplier: "1.0",
      additionalLaborHours: "0",
      description: "Single width fabric, no joining needed"
    },
    {
      id: 2,
      name: "Standard Seaming",
      priceMultiplier: "1.1",
      additionalLaborHours: "0.25",
      description: "Basic straight seams to join fabric widths"
    },
    {
      id: 3,
      name: "Pattern Matching Seams",
      priceMultiplier: "1.3",
      additionalLaborHours: "0.75",
      description: "Careful pattern alignment across seams - requires extra fabric"
    },
    {
      id: 4,
      name: "Complex Pattern Match",
      priceMultiplier: "1.5",
      additionalLaborHours: "1.0",
      description: "Intricate patterns requiring precise matching and extra wastage"
    }
  ]);

  const [calculationRules] = useState([
    {
      id: 1,
      name: "Curtain Fabric Calculation",
      type: "fabric",
      formula: "(width × fullness + allowances) × (drop + hems)",
      active: true,
      description: "Calculate fabric needed for curtains including fullness and allowances"
    },
    {
      id: 2,
      name: "Height-Based Pricing",
      type: "pricing", 
      formula: "base_cost × height_multiplier + extra_labor_hours",
      active: true,
      description: "Apply height-based surcharges for tall curtains"
    },
    {
      id: 3,
      name: "Construction Complexity",
      type: "pricing",
      formula: "base_cost × construction_multiplier + construction_labor",
      active: true,
      description: "Apply pricing for lining, interlining, and construction complexity"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving calculation settings:', {
      settings,
      heightTiers,
      constructionOptions,
      seamingOptions
    });
    
    toast({
      title: "Settings Saved",
      description: "Your calculation settings and pricing tiers have been saved successfully.",
    });
  };

  const addHeightTier = () => {
    const newTier = {
      id: Date.now(),
      name: "New Height Tier",
      minHeight: "0",
      maxHeight: "100",
      basePriceMultiplier: "1.0",
      additionalLaborHours: "0",
      description: ""
    };
    setHeightTiers([...heightTiers, newTier]);
  };

  const updateHeightTier = (id: number, field: string, value: string) => {
    setHeightTiers(prev => prev.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removeHeightTier = (id: number) => {
    setHeightTiers(prev => prev.filter(tier => tier.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Advanced Calculation Rules</h3>
          <p className="text-sm text-brand-neutral">Configure pricing for different heights, lining types, and construction complexity</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-accent">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Basic Fabric Calculation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-primary" />
            Basic Fabric Calculation Settings
          </CardTitle>
          <CardDescription>Base allowances and settings for fabric calculations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Hem Allowances Section */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-brand-primary">Hem Allowances ({lengthUnit})</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p><strong>Important:</strong> All hem values are per side/edge, not total.</p>
                  <p><strong>Header Hem:</strong> Top of curtain - folded once for heading tape or rod pocket</p>
                  <p><strong>Bottom Hem:</strong> Bottom of curtain - typically double-folded for weight</p>
                  <p><strong>Side Hems:</strong> Left and right edges - each side gets this allowance</p>
                  <p><strong>Seam Allowance:</strong> When joining fabric widths - added to each edge being joined</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headerHem">Header Hem (per top edge)</Label>
                <Input 
                  id="headerHem" 
                  type="number" 
                  step="0.5" 
                  value={settings.headerHem}
                  onChange={(e) => handleInputChange('headerHem', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Added once to the top of each panel</p>
              </div>
              <div>
                <Label htmlFor="bottomHem">Bottom Hem (per bottom edge)</Label>
                <Input 
                  id="bottomHem" 
                  type="number" 
                  step="0.5" 
                  value={settings.bottomHem}
                  onChange={(e) => handleInputChange('bottomHem', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Added once to the bottom of each panel</p>
              </div>
              <div>
                <Label htmlFor="sideHem">Side Hem (per side edge)</Label>
                <Input 
                  id="sideHem" 
                  type="number" 
                  step="0.5" 
                  value={settings.sideHem}
                  onChange={(e) => handleInputChange('sideHem', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Added to EACH side (left + right = 2x this value)</p>
              </div>
              <div>
                <Label htmlFor="seamAllowance">Seam Allowance (per join edge)</Label>
                <Input 
                  id="seamAllowance" 
                  type="number" 
                  step="0.1" 
                  value={settings.seamAllowance}
                  onChange={(e) => handleInputChange('seamAllowance', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Added to EACH edge when joining widths (2x per seam)</p>
              </div>
            </div>
          </div>

          {/* Fabric Usage Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-brand-primary">Fabric Usage Calculation</h4>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 text-sm">
                  <p><strong>Fabric Wastage:</strong> Extra fabric percentage to account for cutting mistakes, pattern matching, and unusable fabric ends.</p>
                  <p><strong>Pattern Repeat:</strong> Additional fabric needed when patterns must align across seams.</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabricWastage">Fabric Wastage (%)</Label>
                <Input 
                  id="fabricWastage" 
                  type="number" 
                  step="0.1" 
                  value={settings.fabricWastage}
                  onChange={(e) => handleInputChange('fabricWastage', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Typical range: 3-10% depending on fabric type</p>
              </div>
              <div>
                <Label htmlFor="patternRepeat">Default Pattern Repeat ({lengthUnit})</Label>
                <Input 
                  id="patternRepeat" 
                  type="number" 
                  step="0.5" 
                  value={settings.patternRepeat}
                  onChange={(e) => handleInputChange('patternRepeat', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Set to 0 for plain fabrics, actual repeat for patterned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Height-Based Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-brand-primary" />
            Height-Based Pricing Tiers
          </CardTitle>
          <CardDescription>Different pricing for various curtain heights - taller curtains require more skill and time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Why Height Matters:</strong> Taller curtains are exponentially more difficult to make and handle.</p>
                <p><strong>Challenges:</strong> More fabric joins, difficult to handle, precise measuring, installation complexity.</p>
                <p><strong>Price Multipliers:</strong> Applied to base making cost. Labor hours are added separately.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {heightTiers.map((tier, index) => (
              <div key={tier.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-brand-primary">Height Tier {index + 1}</h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeHeightTier(tier.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label>Tier Name</Label>
                    <Input 
                      value={tier.name}
                      onChange={(e) => updateHeightTier(tier.id, 'name', e.target.value)}
                      placeholder="e.g., Extra Height"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input 
                      value={tier.description}
                      onChange={(e) => updateHeightTier(tier.id, 'description', e.target.value)}
                      placeholder="Describe this height range"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Min Height ({lengthUnit})</Label>
                    <Input 
                      type="number"
                      value={tier.minHeight}
                      onChange={(e) => updateHeightTier(tier.id, 'minHeight', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Max Height ({lengthUnit})</Label>
                    <Input 
                      type="number"
                      value={tier.maxHeight}
                      onChange={(e) => updateHeightTier(tier.id, 'maxHeight', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Price Multiplier</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={tier.basePriceMultiplier}
                      onChange={(e) => updateHeightTier(tier.id, 'basePriceMultiplier', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">1.0 = no change, 1.5 = 50% more</p>
                  </div>
                  <div>
                    <Label>Extra Labor Hours</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={tier.additionalLaborHours}
                      onChange={(e) => updateHeightTier(tier.id, 'additionalLaborHours', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Additional time needed</p>
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={addHeightTier}>
              <Plus className="h-4 w-4 mr-2" />
              Add Height Tier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Construction Complexity Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-primary" />
            Construction & Lining Options
          </CardTitle>
          <CardDescription>Pricing for different lining types and construction methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Construction Types:</strong> Each requires different skills, materials, and time.</p>
                <p><strong>Unlined:</strong> Basic curtain, single layer fabric only.</p>
                <p><strong>Lined:</strong> Fabric + lining sewn together, better drape and privacy.</p>
                <p><strong>Interlined:</strong> Fabric + interlining + lining, premium insulation and body.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {constructionOptions.map((option) => (
              <div key={option.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Construction Type</Label>
                    <Input 
                      value={option.name}
                      className="font-medium"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Price Multiplier</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={option.priceMultiplier}
                      onChange={(e) => {
                        setConstructionOptions(prev => prev.map(opt => 
                          opt.id === option.id ? { ...opt, priceMultiplier: e.target.value } : opt
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Additional Labor Hours</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={option.additionalLaborHours}
                      onChange={(e) => {
                        setConstructionOptions(prev => prev.map(opt => 
                          opt.id === option.id ? { ...opt, additionalLaborHours: e.target.value } : opt
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {option.description}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seaming Complexity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-primary" />
            Seaming & Pattern Matching
          </CardTitle>
          <CardDescription>Additional charges for fabric joining and pattern matching complexity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Seaming Complexity:</strong> Pattern matching can significantly increase labor time and fabric wastage.</p>
                <p><strong>No Seams:</strong> Single width fabric, no joining required.</p>
                <p><strong>Pattern Matching:</strong> Requires careful alignment, extra fabric, and skilled technique.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {seamingOptions.map((option) => (
              <div key={option.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Seaming Type</Label>
                    <Input 
                      value={option.name}
                      className="font-medium"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Price Multiplier</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={option.priceMultiplier}
                      onChange={(e) => {
                        setSeamingOptions(prev => prev.map(opt => 
                          opt.id === option.id ? { ...opt, priceMultiplier: e.target.value } : opt
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Additional Labor Hours</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={option.additionalLaborHours}
                      onChange={(e) => {
                        setSeamingOptions(prev => prev.map(opt => 
                          opt.id === option.id ? { ...opt, additionalLaborHours: e.target.value } : opt
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {option.description}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Calculation Example */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Calculation Example</CardTitle>
          <CardDescription>How the different multipliers work together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">💰 Example: Super Height Interlined Curtains with Pattern Matching</h5>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Base Making Cost:</strong> $100</p>
              <p><strong>Height Multiplier (Super Height):</strong> $100 × 1.6 = $160</p>
              <p><strong>Construction Multiplier (Interlined):</strong> $160 × 1.8 = $288</p>
              <p><strong>Seaming Multiplier (Pattern Match):</strong> $288 × 1.3 = $374.40</p>
              <p><strong>Additional Labor:</strong> 1.0h (height) + 1.5h (interlined) + 0.75h (pattern) = 3.25h extra</p>
              <p><strong>Extra Labor Cost:</strong> 3.25h × $85/hour = $276.25</p>
              <p className="font-bold border-t pt-2"><strong>Total Making Cost:</strong> $374.40 + $276.25 = $650.65</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Rounding */}
      <Card>
        <CardHeader>
          <CardTitle>Measurement Rounding & Markup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rounding">Fabric Measurement Rounding</Label>
              <Select value={settings.rounding} onValueChange={(value) => handleInputChange('rounding', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">No rounding (exact calculation)</SelectItem>
                  <SelectItem value="round_up_5">Round up to nearest 5{lengthUnit}</SelectItem>
                  <SelectItem value="round_up_10">Round up to nearest 10{lengthUnit}</SelectItem>
                  <SelectItem value="round_up_25">Round up to nearest 25{lengthUnit}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultMarkup">Default Making Cost Markup (%)</Label>
              <Input 
                id="defaultMarkup" 
                type="number" 
                step="0.1" 
                value={settings.defaultMarkup}
                onChange={(e) => handleInputChange('defaultMarkup', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Your profit margin on making costs</p>
            </div>
          </div>

          <Button 
            onClick={handleSaveSettings}
            className="bg-brand-primary hover:bg-brand-accent w-full"
          >
            Save All Calculation Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
