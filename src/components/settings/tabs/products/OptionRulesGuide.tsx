import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const OptionRulesGuide = () => {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          How Option Rules Work
        </CardTitle>
        <CardDescription>
          Rules control when options appear, hide, or become required during job creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Show Option:</strong> Makes a hidden option visible when condition is met
              <br />
              <em>Example: When "Eyelet" heading is selected → Show "Eyelet Rings" option</em>
            </AlertDescription>
          </Alert>

          <Alert>
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>Hide Option:</strong> Hides an option when condition is met
              <br />
              <em>Example: When "Sheer" fabric is selected → Hide "Blockout Lining" option</em>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <strong>Require Option:</strong> Forces selection of an option when condition is met
              <br />
              <em>Example: When "Motorised" headrail is selected → Require "Remote Control" option</em>
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>Set Default:</strong> Pre-selects a specific value when condition is met
              <br />
              <em>Example: When "Outdoor" is selected → Set default color to "White"</em>
            </AlertDescription>
          </Alert>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold mb-2">Important Notes:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Option Keys:</strong> Use the exact key name from the Options tab (e.g., "eyelet_rings", "lining_type")</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Rules apply in job creation:</strong> Not visible in Settings → Options, only when creating jobs/quotes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Open browser console (F12):</strong> See detailed logs showing which rules are firing and why</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>Multiple rules:</strong> You can chain rules (Rule A shows Option B, which triggers Rule C to show Option D)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
