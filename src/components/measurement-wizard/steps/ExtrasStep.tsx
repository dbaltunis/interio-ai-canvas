import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const ExtrasStep: React.FC = () => {
  const { notes, setNotes } = useMeasurementWizardStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="notes">Special instructions or notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any special instructions, notes, or requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>
    </div>
  );
};