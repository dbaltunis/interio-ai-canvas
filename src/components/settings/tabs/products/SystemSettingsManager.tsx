import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Upload, RefreshCw, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  measurementUnit: 'cm' | 'inches';
  defaultCurrency: string;
  defaultWastePercent: number;
  defaultFullnessRatio: number;
  autoCalculateRailroading: boolean;
  enableAdvancedFeatures: boolean;
  defaultManufacturingType: 'machine' | 'hand';
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const SystemSettingsManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSettings>({
    measurementUnit: 'cm',
    defaultCurrency: 'USD',
    defaultWastePercent: 5,
    defaultFullnessRatio: 2.0,
    autoCalculateRailroading: true,
    enableAdvancedFeatures: true,
    defaultManufacturingType: 'machine',
    companyInfo: {
      name: '',
      address: '',
      phone: '',
      email: ''
    }
  });

  const handleSave = () => {
    // In a real app, this would save to a backend/local storage
    localStorage.setItem('curtain_system_settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully"
    });
  };

  const handleReset = () => {
    setSettings({
      measurementUnit: 'cm',
      defaultCurrency: 'USD',
      defaultWastePercent: 5,
      defaultFullnessRatio: 2.0,
      autoCalculateRailroading: true,
      enableAdvancedFeatures: true,
      defaultManufacturingType: 'machine',
      companyInfo: {
        name: '',
        address: '',
        phone: '',
        email: ''
      }
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults"
    });
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'curtain_system_settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings file has been downloaded"
    });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        toast({
          title: "Settings Imported",
          description: "Settings have been imported successfully"
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
        <CardDescription>
          Configure global settings for the curtain template system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measurementUnit">Measurement Unit</Label>
                <Select 
                  value={settings.measurementUnit} 
                  onValueChange={(value: 'cm' | 'inches') => 
                    setSettings(prev => ({ ...prev, measurementUnit: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="inches">Inches (in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={settings.defaultCurrency} 
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, defaultCurrency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoCalculateRailroading">Auto-Calculate Railroading</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically determine if railroading is possible based on fabric width
                  </p>
                </div>
                <Switch
                  id="autoCalculateRailroading"
                  checked={settings.autoCalculateRailroading}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoCalculateRailroading: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableAdvancedFeatures">Enable Advanced Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Show advanced options like pattern matching, complex pricing grids
                  </p>
                </div>
                <Switch
                  id="enableAdvancedFeatures"
                  checked={settings.enableAdvancedFeatures}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enableAdvancedFeatures: checked }))
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="defaults" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultWastePercent">Default Waste Percentage</Label>
                <Input
                  id="defaultWastePercent"
                  type="number"
                  step="0.1"
                  value={settings.defaultWastePercent}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, defaultWastePercent: parseFloat(e.target.value) || 0 }))
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">Applied to new templates</p>
              </div>

              <div>
                <Label htmlFor="defaultFullnessRatio">Default Fullness Ratio</Label>
                <Input
                  id="defaultFullnessRatio"
                  type="number"
                  step="0.1"
                  value={settings.defaultFullnessRatio}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, defaultFullnessRatio: parseFloat(e.target.value) || 0 }))
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">Standard pleating ratio</p>
              </div>
            </div>

            <div>
              <Label htmlFor="defaultManufacturingType">Default Manufacturing Type</Label>
              <Select 
                value={settings.defaultManufacturingType} 
                onValueChange={(value: 'machine' | 'hand') => 
                  setSettings(prev => ({ ...prev, defaultManufacturingType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="machine">Machine Finished</SelectItem>
                  <SelectItem value="hand">Hand Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Current Defaults Preview</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Waste: {settings.defaultWastePercent}%</Badge>
                <Badge variant="secondary">Fullness: {settings.defaultFullnessRatio}:1</Badge>
                <Badge variant="secondary">Manufacturing: {settings.defaultManufacturingType}</Badge>
                <Badge variant="secondary">Unit: {settings.measurementUnit}</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.companyInfo.name}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))
                  }
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyInfo.address}
                  onChange={(e) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      companyInfo: { ...prev.companyInfo, address: e.target.value }
                    }))
                  }
                  placeholder="Company address for quotes and invoices"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyInfo.phone}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        companyInfo: { ...prev.companyInfo, phone: e.target.value }
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyInfo.email}
                    onChange={(e) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        companyInfo: { ...prev.companyInfo, email: e.target.value }
                      }))
                    }
                    placeholder="info@company.com"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" asChild>
              <label htmlFor="import-settings" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </label>
            </Button>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportSettings}
            />
            
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};