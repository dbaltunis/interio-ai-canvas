import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Grid3x3, Link as LinkIcon, Sparkles } from 'lucide-react';
import { WizardData } from '../PricingGridWizard';

interface StepReviewProps {
  wizardData: WizardData;
  onComplete: () => void;
}

export const StepReview = ({ wizardData, onComplete }: StepReviewProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-semibold">Setup Complete!</h3>
        <p className="text-muted-foreground">
          Your price list is now active and ready to use
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Grid Info */}
        <Card className="p-6 border-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Grid3x3 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold mb-1">Price List Created</h4>
              <p className="text-sm text-muted-foreground break-words">
                <strong>{wizardData.gridName}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Code: {wizardData.gridCode}
              </p>
            </div>
          </div>
        </Card>

        {/* Rule Info */}
        <Card className="p-6 border-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold mb-1">Routing Configured</h4>
              <p className="text-sm text-muted-foreground">
                <strong>{wizardData.productType.replace('_', ' ')}</strong>
              </p>
              {wizardData.systemType && (
                <p className="text-xs text-muted-foreground">
                  System: {wizardData.systemType}
                </p>
              )}
              {wizardData.priceGroup && (
                <p className="text-xs text-muted-foreground">
                  Group: {wizardData.priceGroup}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* How it works */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          What happens now?
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">1.</span>
            <span>
              When creating a quote, select <strong>{wizardData.productType.replace('_', ' ')}</strong>
              {wizardData.systemType && ` with ${wizardData.systemType} system`}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">2.</span>
            <span>
              {wizardData.priceGroup 
                ? `Choose a fabric from price group "${wizardData.priceGroup}"`
                : 'Choose any fabric (all groups will use this price list)'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">3.</span>
            <span>
              The system will automatically use <strong>{wizardData.gridName}</strong> to calculate the price
            </span>
          </li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={onComplete}
          className="flex-1"
          size="lg"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Create Another Price List
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
          className="flex-1"
          size="lg"
        >
          View All Price Lists
        </Button>
      </div>
    </div>
  );
};
