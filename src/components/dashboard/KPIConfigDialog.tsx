import { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIConfig } from '@/hooks/useKPIConfig';

interface KPIConfigDialogProps {
  kpiConfigs: KPIConfig[];
  onToggleKPI: (id: string) => void;
}

export const KPIConfigDialog = ({ kpiConfigs, onToggleKPI }: KPIConfigDialogProps) => {
  const [open, setOpen] = useState(false);

  const categorizeKPIs = (category: 'primary' | 'email' | 'business') => {
    return kpiConfigs
      .filter(config => config.category === category)
      .sort((a, b) => a.order - b.order);
  };

  const categoryLabels = {
    primary: 'Primary KPIs',
    email: 'Email Performance',
    business: 'Business Metrics'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customize KPIs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard KPIs</DialogTitle>
          <DialogDescription>
            Toggle KPIs on/off and drag them to reorder within each section.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {(['primary', 'email', 'business'] as const).map(category => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{categoryLabels[category]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorizeKPIs(category).map(config => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {config.enabled ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`font-medium ${config.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {config.title}
                      </span>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => onToggleKPI(config.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};