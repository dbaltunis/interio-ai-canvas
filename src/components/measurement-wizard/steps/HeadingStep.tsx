import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';
import { useHeadingInventory } from '@/hooks/useHeadingInventory';

export const HeadingStep: React.FC = () => {
  const { selectedHeading, selectedFinish, setHeading, setFinish } = useMeasurementWizardStore();
  const { data: headingItems, isLoading } = useHeadingInventory();

  // Build heading options from database
  const headingOptions = React.useMemo(() => {
    const options = [
      { value: 'none', label: 'Standard / No Heading', fullness: 1 }
    ];
    
    if (headingItems && headingItems.length > 0) {
      headingItems.forEach(item => {
        const metadata = item.metadata as any;
        const fullness = (item as any).fullness_ratio || metadata?.fullness_ratio || 2;
        options.push({
          value: item.id,
          label: item.name,
          fullness
        });
      });
    }
    
    return options;
  }, [headingItems]);

  const finishOptions = [
    { value: 'standard', label: 'Standard Finish' },
    { value: 'hand_finished', label: 'Hand Finished' },
    { value: 'contrast_trim', label: 'Contrast Trim' }
  ];

  // Auto-select first option if none selected
  useEffect(() => {
    if (!selectedHeading && headingOptions.length > 0) {
      setHeading(headingOptions[0].value);
    }
    if (!selectedFinish && finishOptions.length > 0) {
      setFinish(finishOptions[0].value);
    }
  }, [selectedHeading, selectedFinish, setHeading, setFinish, headingOptions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Heading Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Heading Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedHeading} onValueChange={setHeading}>
            {headingOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between space-x-2 py-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
                <Badge variant="outline" className="text-xs">
                  {option.fullness}x fullness
                </Badge>
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
