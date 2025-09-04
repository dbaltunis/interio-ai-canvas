import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const HeadingStep: React.FC = () => {
  const { selectedHeading, selectedFinish, setHeading, setFinish } = useMeasurementWizardStore();

  const headingOptions = [
    { value: 'pinch_pleat', label: 'Pinch Pleat' },
    { value: 'pencil_pleat', label: 'Pencil Pleat' },
    { value: 'eyelet', label: 'Eyelet' },
    { value: 'tab_top', label: 'Tab Top' }
  ];

  const finishOptions = [
    { value: 'standard', label: 'Standard Finish' },
    { value: 'hand_finished', label: 'Hand Finished' },
    { value: 'contrast_trim', label: 'Contrast Trim' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heading Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedHeading} onValueChange={setHeading}>
            {headingOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finish Options</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedFinish} onValueChange={setFinish}>
            {finishOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};