import React, { useState } from 'react';
import { SettingsCard, SettingsSection, SettingsToggle, SettingsInput, SettingsAction } from '@/components/ui/settings-components';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor, 
  Zap, 
  Eye, 
  Volume2, 
  Bell,
  Smartphone,
  Download,
  Upload,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const EnhancedPersonalizationTab = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('blue');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState([14]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPreviews, setNotificationPreviews] = useState(true);

  const handleExportSettings = () => {
    const settings = {
      theme,
      accentColor,
      compactMode,
      animationsEnabled,
      reducedMotion,
      fontSize: fontSize[0],
      soundEnabled,
      notificationPreviews
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'interio-settings.json';
    link.click();
    
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported successfully"
    });
  };

  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target?.result as string);
            // Apply imported settings
            setTheme(settings.theme || 'system');
            setAccentColor(settings.accentColor || 'blue');
            setCompactMode(settings.compactMode || false);
            setAnimationsEnabled(settings.animationsEnabled !== false);
            setReducedMotion(settings.reducedMotion || false);
            setFontSize([settings.fontSize || 14]);
            setSoundEnabled(settings.soundEnabled !== false);
            setNotificationPreviews(settings.notificationPreviews !== false);
            
            toast({
              title: "Settings Imported",
              description: "Your settings have been imported successfully"
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid settings file",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetToDefaults = () => {
    setTheme('system');
    setAccentColor('blue');
    setCompactMode(false);
    setAnimationsEnabled(true);
    setReducedMotion(false);
    setFontSize([14]);
    setSoundEnabled(true);
    setNotificationPreviews(true);
    
    toast({
      title: "Settings Reset",
      description: "All personalization settings have been reset to defaults"
    });
  };

  const accentColors = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <SettingsSection title="Theme & Appearance" description="Customize the look and feel of your interface">
        <SettingsCard
          title="Color Theme"
          description="Choose how the interface appears"
          icon={<Palette className="h-5 w-5 text-primary" />}
          status={theme === 'dark' ? 'enabled' : theme === 'light' ? 'disabled' : 'pending'}
        >
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2 justify-start hover-lift"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2 justify-start hover-lift"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex items-center gap-2 justify-start hover-lift"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Accent Color"
          description="Choose your preferred accent color"
          icon={<Sparkles className="h-5 w-5 text-primary" />}
        >
          <div className="grid grid-cols-6 gap-3">
            {accentColors.map((color) => (
              <Button
                key={color.value}
                variant="outline"
                onClick={() => setAccentColor(color.value)}
                className={`p-3 hover-lift ${accentColor === color.value ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full ${color.color}`} />
              </Button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Display Density"
          description="Adjust the spacing and density of interface elements"
          icon={<Eye className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Compact Mode"
              description="Use smaller spacing and tighter layouts"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size: {fontSize[0]}px</label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                max={18}
                min={12}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Motion & Effects" description="Control animations and visual effects">
        <SettingsCard
          title="Animation Preferences"
          description="Customize motion and transition effects"
          icon={<Zap className="h-5 w-5 text-primary" />}
        >
          <div className="space-y-4">
            <SettingsToggle
              label="Enable Animations"
              description="Show smooth transitions and hover effects"
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
            
            <SettingsToggle
              label="Reduce Motion"
              description="Minimize animations for accessibility"
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Sound & Notifications" description="Configure audio feedback and notification behavior">
        <SettingsCard
          title="Audio Feedback"
          description="Control sound effects and audio cues"
          icon={<Volume2 className="h-5 w-5 text-primary" />}
        >
          <SettingsToggle
            label="Sound Effects"
            description="Play sounds for actions and notifications"
            checked={soundEnabled}
            onCheckedChange={setSoundEnabled}
          />
        </SettingsCard>

        <SettingsCard
          title="Notification Display"
          description="Customize how notifications appear"
          icon={<Bell className="h-5 w-5 text-primary" />}
        >
          <SettingsToggle
            label="Show Previews"
            description="Display notification content in previews"
            checked={notificationPreviews}
            onCheckedChange={setNotificationPreviews}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Settings Management" description="Import, export, or reset your personalization settings">
        <SettingsCard
          title="Settings Backup"
          description="Save or restore your customization preferences"
          icon={<RefreshCw className="h-5 w-5 text-primary" />}
        >
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportSettings}
              variant="outline"
              className="flex items-center gap-2 hover-lift"
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            
            <Button
              onClick={handleImportSettings}
              variant="outline"
              className="flex items-center gap-2 hover-lift"
            >
              <Upload className="h-4 w-4" />
              Import Settings
            </Button>
            
            <Button
              onClick={resetToDefaults}
              variant="destructive"
              className="flex items-center gap-2 hover-lift"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </SettingsCard>
      </SettingsSection>
    </div>
  );
};