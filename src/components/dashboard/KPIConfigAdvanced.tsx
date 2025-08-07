import { useState } from 'react';
import { Settings2, RefreshCw, Palette, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KPIConfig } from '@/hooks/useKPIConfig';
import { useToast } from '@/hooks/use-toast';

interface KPIConfigAdvancedProps {
  kpiConfigs: KPIConfig[];
  onUpdateProperty: (id: string, property: keyof KPIConfig, value: any) => void;
  onResetToDefaults: () => void;
}

export const KPIConfigAdvanced = ({ 
  kpiConfigs, 
  onUpdateProperty, 
  onResetToDefaults 
}: KPIConfigAdvancedProps) => {
  const [open, setOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedConfig = selectedKPI ? kpiConfigs.find(k => k.id === selectedKPI) : null;

  const colorPresets = [
    { name: 'Default', value: undefined },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Primary', value: '#415e6b' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Secondary', value: '#9bb6bc' },
    { name: 'Teal', value: '#14B8A6' },
  ];

  const handleSave = () => {
    toast({
      title: "KPI Settings Saved",
      description: "Your customizations have been applied successfully.",
    });
    setOpen(false);
  };

  const handleReset = () => {
    onResetToDefaults();
    toast({
      title: "Settings Reset",
      description: "All KPI customizations have been reset to defaults.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Advanced Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced KPI Customization</DialogTitle>
          <DialogDescription>
            Customize display formats, refresh intervals, colors, and thresholds for your KPIs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPI Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select KPI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {kpiConfigs.map(config => (
                <Button
                  key={config.id}
                  variant={selectedKPI === config.id ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedKPI(config.id)}
                >
                  <div className="flex items-center gap-2">
                    {config.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: config.color }}
                      />
                    )}
                    {config.customTitle || config.title}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            {selectedConfig ? (
              <Tabs defaultValue="display" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="display">Display</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="display" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-title">Custom Title</Label>
                        <Input
                          id="custom-title"
                          placeholder={selectedConfig.title}
                          value={selectedConfig.customTitle || ''}
                          onChange={(e) => onUpdateProperty(selectedConfig.id, 'customTitle', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Display Format</Label>
                        <Select
                          value={selectedConfig.displayFormat}
                          onValueChange={(value) => onUpdateProperty(selectedConfig.id, 'displayFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Card View</SelectItem>
                            <SelectItem value="compact">Compact View</SelectItem>
                            <SelectItem value="gauge">Gauge View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={selectedConfig.size}
                          onValueChange={(value) => onUpdateProperty(selectedConfig.id, 'size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-trend">Show Trend</Label>
                        <Switch
                          id="show-trend"
                          checked={selectedConfig.showTrend}
                          onCheckedChange={(checked) => onUpdateProperty(selectedConfig.id, 'showTrend', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Data Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Data Period</Label>
                        <Select
                          value={selectedConfig.dataPeriod}
                          onValueChange={(value) => onUpdateProperty(selectedConfig.id, 'dataPeriod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="all">All time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Refresh Interval (minutes): {selectedConfig.refreshInterval}</Label>
                        <Slider
                          value={[selectedConfig.refreshInterval]}
                          onValueChange={([value]) => onUpdateProperty(selectedConfig.id, 'refreshInterval', value)}
                          max={60}
                          min={1}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 min</span>
                          <span>60 min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Alert Thresholds</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="warning-threshold">Warning Threshold</Label>
                        <Input
                          id="warning-threshold"
                          type="number"
                          placeholder="Enter warning value"
                          value={selectedConfig.thresholds?.warning || ''}
                          onChange={(e) => onUpdateProperty(selectedConfig.id, 'thresholds', {
                            ...selectedConfig.thresholds,
                            warning: parseFloat(e.target.value) || undefined
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="critical-threshold">Critical Threshold</Label>
                        <Input
                          id="critical-threshold"
                          type="number"
                          placeholder="Enter critical value"
                          value={selectedConfig.thresholds?.critical || ''}
                          onChange={(e) => onUpdateProperty(selectedConfig.id, 'thresholds', {
                            ...selectedConfig.thresholds,
                            critical: parseFloat(e.target.value) || undefined
                          })}
                        />
                      </div>

                      <div className="text-xs text-gray-500">
                        Set thresholds to receive alerts when KPI values reach specified levels.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Style Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorPresets.map(preset => (
                            <Button
                              key={preset.name}
                              variant={selectedConfig.color === preset.value ? "default" : "outline"}
                              className="h-12 flex flex-col items-center gap-1 text-xs"
                              onClick={() => onUpdateProperty(selectedConfig.id, 'color', preset.value)}
                            >
                              {preset.value ? (
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: preset.value }}
                                />
                              ) : (
                                <Palette className="w-4 h-4" />
                              )}
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="custom-color">Custom Color</Label>
                        <Input
                          id="custom-color"
                          type="color"
                          value={selectedConfig.color || '#3B82F6'}
                          onChange={(e) => onUpdateProperty(selectedConfig.id, 'color', e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <Settings2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a KPI to customize its settings</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};