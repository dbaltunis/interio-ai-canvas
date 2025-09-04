import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle } from 'lucide-react';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const PanelsStep: React.FC = () => {
  const { panelSetup, setPanelSetup } = useMeasurementWizardStore();

  const panelOptions = [
    {
      value: 'pair',
      title: 'Pair of Panels',
      description: 'Two panels that open from the center',
      visual: '[ ] [ ]'
    },
    {
      value: 'single_left',
      title: 'Single Panel - Left',
      description: 'One panel opening to the left',
      visual: '[ ] ·'
    },
    {
      value: 'single_right',
      title: 'Single Panel - Right',
      description: 'One panel opening to the right',
      visual: '· [ ]'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Panel Configuration</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose how your panels will be configured and operate.
        </p>
      </div>

      <RadioGroup value={panelSetup} onValueChange={setPanelSetup}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {panelOptions.map((option) => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className="cursor-pointer"
              >
                <Card className="peer-checked:ring-2 peer-checked:ring-primary transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{option.title}</CardTitle>
                      {panelSetup === option.value && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-mono text-center py-4 bg-muted rounded-lg">
                      {option.visual}
                    </div>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Panel Setup Details</h4>
        <div className="space-y-2 text-sm">
          {panelSetup === 'pair' && (
            <>
              <p>• Two panels will be created</p>
              <p>• Panels will stack or overlap when opened</p>
              <p>• Consider return and overlap measurements</p>
            </>
          )}
          {panelSetup === 'single_left' && (
            <>
              <p>• One panel opening to the left</p>
              <p>• Consider wall clearance on the left side</p>
              <p>• Return measurement applies to left side only</p>
            </>
          )}
          {panelSetup === 'single_right' && (
            <>
              <p>• One panel opening to the right</p>
              <p>• Consider wall clearance on the right side</p>
              <p>• Return measurement applies to right side only</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};