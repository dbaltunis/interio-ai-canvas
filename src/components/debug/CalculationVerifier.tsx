import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Calculator
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CalculationVerifierProps {
  windowId: string;
  displayedData: {
    fullness?: number;
    fabricUsage?: number;
    totalCost?: number;
    optionsCost?: number;
    fabricCost?: number;
    manufacturingCost?: number;
  };
}

interface VerificationResult {
  field: string;
  displayedValue: any;
  databaseValue: any;
  calculatedValue?: any;
  status: 'match' | 'mismatch' | 'warning';
  details?: string;
}

export const CalculationVerifier = ({ windowId, displayedData }: CalculationVerifierProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const verifyData = async () => {
    setIsVerifying(true);
    setError(null);
    setResults([]);

    try {
      // Fetch database data
      const { data: dbData, error: fetchError } = await supabase
        .from("windows_summary")
        .select("*")
        .eq("window_id", windowId)
        .maybeSingle();

      if (fetchError) {
        setError(`Database fetch error: ${fetchError.message}`);
        return;
      }

      if (!dbData) {
        setError("No data found in database for this window");
        return;
      }

      const measurementsDetails = dbData.measurements_details as any || {};
      const verificationResults: VerificationResult[] = [];

      // Verify fullness
      const dbFullness = measurementsDetails.heading_fullness || 
                         measurementsDetails.fullness_ratio || 
                         (dbData.template_details as any)?.fullness_ratio;
      verificationResults.push({
        field: 'Fullness Ratio',
        displayedValue: displayedData.fullness,
        databaseValue: dbFullness,
        status: displayedData.fullness === dbFullness ? 'match' : 'mismatch',
        details: displayedData.fullness !== dbFullness 
          ? `Displayed ${displayedData.fullness}x but DB has ${dbFullness}x`
          : undefined
      });

      // Verify total cost
      verificationResults.push({
        field: 'Total Cost',
        displayedValue: displayedData.totalCost,
        databaseValue: dbData.total_cost,
        status: Math.abs((displayedData.totalCost || 0) - (dbData.total_cost || 0)) < 0.01 
          ? 'match' 
          : 'mismatch',
        details: displayedData.totalCost !== dbData.total_cost
          ? `Displayed ${displayedData.totalCost} but DB has ${dbData.total_cost}`
          : undefined
      });

      // Verify options cost
      verificationResults.push({
        field: 'Options Cost',
        displayedValue: displayedData.optionsCost,
        databaseValue: dbData.options_cost,
        status: Math.abs((displayedData.optionsCost || 0) - (dbData.options_cost || 0)) < 0.01 
          ? 'match' 
          : 'mismatch',
        details: displayedData.optionsCost !== dbData.options_cost
          ? `Displayed ${displayedData.optionsCost} but DB has ${dbData.options_cost}`
          : undefined
      });

      // Verify fabric cost
      verificationResults.push({
        field: 'Fabric Cost',
        displayedValue: displayedData.fabricCost,
        databaseValue: dbData.fabric_cost,
        status: Math.abs((displayedData.fabricCost || 0) - (dbData.fabric_cost || 0)) < 0.01 
          ? 'match' 
          : 'mismatch',
        details: displayedData.fabricCost !== dbData.fabric_cost
          ? `Displayed ${displayedData.fabricCost} but DB has ${dbData.fabric_cost}`
          : undefined
      });

      // Verify manufacturing cost
      verificationResults.push({
        field: 'Manufacturing Cost',
        displayedValue: displayedData.manufacturingCost,
        databaseValue: dbData.manufacturing_cost,
        status: Math.abs((displayedData.manufacturingCost || 0) - (dbData.manufacturing_cost || 0)) < 0.01 
          ? 'match' 
          : 'mismatch',
        details: displayedData.manufacturingCost !== dbData.manufacturing_cost
          ? `Displayed ${displayedData.manufacturingCost} but DB has ${dbData.manufacturing_cost}`
          : undefined
      });

      // Log full data comparison for debugging
      console.log('📊 [VERIFY] Full data comparison:', {
        displayed: displayedData,
        database: {
          fullness: dbFullness,
          total_cost: dbData.total_cost,
          options_cost: dbData.options_cost,
          fabric_cost: dbData.fabric_cost,
          manufacturing_cost: dbData.manufacturing_cost,
          measurements_details: measurementsDetails
        }
      });

      setResults(verificationResults);
    } catch (err) {
      console.error('Verification error:', err);
      setError(`Verification failed: ${err}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const hasIssues = results.some(r => r.status === 'mismatch');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <Card className="border-dashed">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Data Verification
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyData}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Verify
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3">
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <>
            {hasIssues && (
              <Alert variant="destructive" className="mb-2">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Data mismatch detected! Displayed values differ from database.
                </AlertDescription>
              </Alert>
            )}

            {!hasIssues && !hasWarnings && (
              <Alert className="mb-2 border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-xs text-green-700">
                  All values match the database.
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs flex items-center justify-between ${
                      result.status === 'match' 
                        ? 'bg-green-500/10' 
                        : result.status === 'warning'
                        ? 'bg-yellow-500/10'
                        : 'bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.status === 'match' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : result.status === 'warning' ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className="font-medium">{result.field}</span>
                    </div>
                    <div className="text-right">
                      {result.status === 'match' ? (
                        <span className="text-green-700">{result.displayedValue}</span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-red-700">UI: {result.displayedValue}</span>
                          <span className="text-muted-foreground">DB: {result.databaseValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {results.length === 0 && !error && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Click "Verify" to compare displayed data with database
          </p>
        )}
      </CardContent>
    </Card>
  );
};
