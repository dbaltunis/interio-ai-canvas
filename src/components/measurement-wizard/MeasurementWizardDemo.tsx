import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MeasurementWizard } from '@/components/measurement-wizard/MeasurementWizard';

const MeasurementWizardDemo: React.FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Measurement Wizard Demo</CardTitle>
          <CardDescription>
            A comprehensive 8-step wizard for measuring and pricing bespoke window coverings.
            This data-driven system handles templates, measurements, fabric selection, and real-time pricing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setWizardOpen(true)}
            size="lg"
          >
            Launch Measurement Wizard
          </Button>
        </CardContent>
      </Card>

      <MeasurementWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />
    </div>
  );
};

export default MeasurementWizardDemo;